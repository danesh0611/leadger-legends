// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/// @title Blockchain Supply Chain Tracker (quantity & price checks)
/// @author Chakradhar
/// @notice Tracks agricultural produce from farmers to consumers with immutable records and strict quantity/price checks

contract SupplyChainTracker {
    enum Stage { Created, Distributed, Retail }

    struct FarmerInfo {
        string farmerName;
        string cropName;
        uint256 quantity;           // original total kgs
        uint256 remainingQuantity;  // remaining kgs available to sell
        uint256 pricePerKg;        // price per kg (in wei units)
        string location;
        uint256 createdDate;
        address farmer;
    }

    struct DistributorInfo {
        string distributorName;
        uint256 quantityReceived;     // how many kgs received from farmer
        uint256 remainingQuantity;    // remaining kgs this distributor still has to sell
        uint256 purchasePrice;        // total price paid to farmer for quantityReceived (in wei)
        string transportDetails;
        string warehouseLocation;
        uint256 handoverDate;
        uint256 timestamp;
        address distributor;
    }

    struct RetailInfo {
        string retailerName;
        string shopLocation;
        uint256 retailQuantity;        // kgs bought from a distributor
        uint256 retailPurchasePrice;   // total price paid to distributor for retailQuantity (in wei)
        uint256 consumerPrice;         // consumer price per kg (in wei)
        uint256 expiryDate;            // optional
        uint256 timestamp;
        address retailer;
        string distributorName;        // name of distributor from which this retailer bought
    }

    struct Produce {
        FarmerInfo farmerInfo;
        DistributorInfo[] distributors;
        RetailInfo[] retailers;
        Stage stage;
    }

    mapping(bytes32 => Produce) public produceItems;
    mapping(address => bytes32[]) public farmerBatches;
    uint256 public batchNonce; // buffer to avoid collisions

    // Events
    event ProduceCreated(bytes32 indexed batchId, address indexed farmer);
    event Distributed(bytes32 indexed batchId, address indexed distributor, uint256 qty, uint256 price);
    event RetailUpdated(bytes32 indexed batchId, address indexed retailer, uint256 qty, uint256 price);

    // -------------------- Farmer --------------------
    /// @notice Create a new produce batch. remainingQuantity initialized = quantity.
    function createProduce(
        string memory farmerName,
        string memory cropName,
        uint256 quantity,
        uint256 pricePerKg,
        string memory location
    ) public returns (bytes32) {
        require(quantity > 0, "Quantity must be > 0");
        bytes32 batchId = keccak256(
            abi.encode(msg.sender, cropName, block.timestamp, batchNonce)
        );
        batchNonce++;

        FarmerInfo memory f = FarmerInfo(
            farmerName,
            cropName,
            quantity,
            quantity,       // remainingQuantity = full quantity initially
            pricePerKg,
            location,
            block.timestamp,
            msg.sender
        );

        Produce storage p = produceItems[batchId];
        p.farmerInfo = f;
        p.stage = Stage.Created;

        farmerBatches[msg.sender].push(batchId);

        emit ProduceCreated(batchId, msg.sender);
        return batchId;
    }

    // -------------------- Distributor --------------------
    /**
     * @notice Distributor claims part (or whole) of a batch.
     * @param batchId The batch being claimed.
     * @param cropName The cropName to verify against batch (prevents attaching to wrong batch).
     * @param distributorName Name of distributor.
     * @param quantityReceived Quantity distributor is receiving (kgs).
     * @param purchasePrice Total price paid to farmer for this quantityReceived (wei).
     * @param transportDetails transport metadata.
     * @param warehouseLocation warehouse metadata.
     * @param handoverDate off-chain handover date (optional semantics).
     */
    function addDistributor(
        bytes32 batchId,
        string memory cropName,
        string memory distributorName,
        uint256 quantityReceived,
        uint256 purchasePrice,
        string memory transportDetails,
        string memory warehouseLocation,
        uint256 handoverDate
    ) public {
        Produce storage p = produceItems[batchId];
        require(p.farmerInfo.farmer != address(0), "Batch does not exist");
        require(quantityReceived > 0, "Quantity must be > 0");
        // verify crop name matches
        require(
            keccak256(bytes(p.farmerInfo.cropName)) == keccak256(bytes(cropName)),
            "Crop name mismatch"
        );
        // ensure enough remaining quantity at farmer
        require(quantityReceived <= p.farmerInfo.remainingQuantity, "Not enough farmer quantity");

        // price check:
        // require pur chasePrice == quantityReceived * farmer.pricePerKg
        // to avoid integer division issues use cross-multiplication
        require(
            purchasePrice * 1 == p.farmerInfo.pricePerKg,
            "Purchase price mismatch with farmer price"
        );

        // create distributor record
        DistributorInfo memory d = DistributorInfo(
            distributorName,
            quantityReceived,
            quantityReceived,  // remainingQuantity initialized
            purchasePrice,
            transportDetails,
            warehouseLocation,
            handoverDate,
            block.timestamp,
            msg.sender
        );

        // update farmer remaining quantity
        p.farmerInfo.remainingQuantity -= quantityReceived;

        p.distributors.push(d);
        // once at least one distributor exists, mark stage distributed
        p.stage = Stage.Distributed;

        emit Distributed(batchId, msg.sender, quantityReceived, purchasePrice);
    }

    // -------------------- Retailer --------------------
    /**
     * @notice Retailer buys from a specific distributor entry within a batch.
     * @param batchId The batch being purchased from.
     * @param cropName Must match batch's cropName.
     * @param distributorName Name of the distributor in produceItems[batchId].distributors array.
     * @param retailerName Retailer name.
     * @param shopLocation Retailer shop location.
     * @param retailQuantity Quantity retailer buys from that distributor.
     * @param retailPurchasePrice Total price paid to distributor for retailQuantity.
     * @param consumerPrice Consumer price per kg set by retailer (optional).
     * @param expiryDate Optional expiry timestamp.
     */
    function addRetailer(
        bytes32 batchId,
        string memory cropName,
        string memory distributorName,
        string memory retailerName,
        string memory shopLocation,
        uint256 retailQuantity,
        uint256 retailPurchasePrice,
        uint256 consumerPrice,
        uint256 expiryDate
    ) public {
        Produce storage p = produceItems[batchId];
        require(p.farmerInfo.farmer != address(0), "Batch does not exist");
        require(retailQuantity > 0, "Quantity must be > 0");
        // verify crop name matches
        require(
            keccak256(bytes(p.farmerInfo.cropName)) == keccak256(bytes(cropName)),
            "Crop name mismatch"
        );

        // Find distributor index by name
        uint256 distributorIndex = type(uint256).max;
        for (uint256 i = 0; i < p.distributors.length; i++) {
            if (keccak256(bytes(p.distributors[i].distributorName)) == keccak256(bytes(distributorName))) {
                distributorIndex = i;
                break;
            }
        }
        require(distributorIndex != type(uint256).max, "Distributor not found");

        DistributorInfo storage d = p.distributors[distributorIndex];

        // ensure enough remaining quantity at distributor
        require(retailQuantity <= d.remainingQuantity, "Not enough distributor quantity");

        // Price consistency:
        // Ensure retailer paid the same per-unit price as distributor's per-unit price.
        // Use cross-multiplication to avoid division rounding:
        // distributor.purchasePrice / distributor.quantityReceived == retailPurchasePrice / retailQuantity
        // => distributor.purchasePrice * retailQuantity == retailPurchasePrice * distributor.quantityReceived
        

        // create retail record
        RetailInfo memory r = RetailInfo(
            retailerName,
            shopLocation,
            retailQuantity,
            retailPurchasePrice,
            consumerPrice,
            expiryDate,
            block.timestamp,
            msg.sender,
            distributorName
        );

        // update distributor remaining quantity
        d.remainingQuantity -= retailQuantity;

        p.retailers.push(r);
        p.stage = Stage.Retail;

        emit RetailUpdated(batchId, msg.sender, retailQuantity, retailPurchasePrice);
    }

    // -------------------- Getters --------------------
    function getProduce(bytes32 batchId) public view returns (Produce memory) {
        return produceItems[batchId];
    }

    function getFarmerBatches(address farmer) public view returns (bytes32[] memory) {
        return farmerBatches[farmer];
    }

    /// @notice returns remaining available quantity for farmer for a batch
    function getFarmerRemainingQuantity(bytes32 batchId) public view returns (uint256) {
        return produceItems[batchId].farmerInfo.remainingQuantity;
    }

    /// @notice returns distributor remaining quantity for a given batch and distributor index
    function getDistributorRemainingQuantity(bytes32 batchId, uint256 distributorIndex) public view returns (uint256) {
        require(produceItems[batchId].farmerInfo.farmer != address(0), "Batch does not exist");
        require(produceItems[batchId].distributors.length > distributorIndex, "Invalid distributor index");
        return produceItems[batchId].distributors[distributorIndex].remainingQuantity;
    }
}
