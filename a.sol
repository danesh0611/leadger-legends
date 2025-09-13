// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Blockchain Supply Chain Tracker (quantity & price checks)
/// @author …
contract SupplyChainTracker {
    enum Stage { Created, Distributed, Retail }

    struct FarmerInfo {
        string farmerName;
        string cropName;
        uint256 quantity;
        uint256 remainingQuantity;
        uint256 pricePerKg;
        string location;
        uint256 createdDate;
        address farmer;
    }

    struct DistributorInfo {
        string distributorName;
        uint256 quantityReceived;
        uint256 remainingQuantity;
        uint256 totalAmountPaid;
        string transportDetails;
        string warehouseLocation;
        uint256 handoverDate;
        uint256 timestamp;
        address distributor;
    }

    struct RetailInfo {
        string retailerName;
        string shopLocation;
        uint256 retailQuantity;
        uint256 retailPurchasePrice;
        uint256 consumerPrice;
        uint256 expiryDate;
        uint256 timestamp;
        address retailer;
        string distributorName;  
    }

    struct Produce {
        FarmerInfo farmerInfo;
        DistributorInfo[] distributors;
        mapping(address => RetailInfo[]) distributorRetailers; // ✅ retailers grouped under distributor
        Stage stage;
    }

    mapping(bytes32 => Produce) public produceItems;
    mapping(address => bytes32[]) public farmerBatches;
    uint256 public batchNonce;

    // Events
    event ProduceCreated(bytes32 indexed batchId, address indexed farmer);
    event Distributed(bytes32 indexed batchId, address indexed distributor, uint256 qty, uint256 price);
    event RetailUpdated(bytes32 indexed batchId, address indexed retailer, uint256 qty, uint256 price);

    // -------------------- Farmer --------------------
    function createProduce(
        string memory farmerName,
        string memory cropName,
        uint256 quantity,
        uint256 pricePerKg,
        string memory location
    ) public returns (bytes32) {
        require(quantity > 0, "Quantity must be > 0");
        require(pricePerKg > 0, "Price must be > 0");

        bytes32 batchId = keccak256(
            abi.encode(msg.sender, cropName, block.timestamp, batchNonce)
        );
        batchNonce++;

        FarmerInfo memory f = FarmerInfo(
            farmerName,
            cropName,
            quantity,
            quantity,
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
    function addDistributor(
        bytes32 batchId,
        string memory cropName,
        string memory distributorName,
        uint256 quantityReceived,
        uint256 offeredPricePerKg,
        string memory transportDetails,
        string memory warehouseLocation,
        uint256 handoverDate
    ) public {
        require(offeredPricePerKg > 0, "Price per kg must be > 0");
        Produce storage p = produceItems[batchId];
        require(p.farmerInfo.farmer != address(0), "Batch does not exist");
        require(quantityReceived > 0, "Quantity must be > 0");
        require(
            keccak256(bytes(p.farmerInfo.cropName)) == keccak256(bytes(cropName)),
            "Crop name mismatch"
        );
        require(quantityReceived <= p.farmerInfo.remainingQuantity, "Not enough farmer quantity");
        require(offeredPricePerKg == p.farmerInfo.pricePerKg, "Price mismatch");

        uint256 totalAmountPaid = quantityReceived * offeredPricePerKg;

        DistributorInfo memory d = DistributorInfo(
            distributorName,
            quantityReceived,
            quantityReceived,
            totalAmountPaid,
            transportDetails,
            warehouseLocation,
            handoverDate,
            block.timestamp,
            msg.sender
        );

        p.farmerInfo.remainingQuantity -= quantityReceived;
        p.distributors.push(d);
        p.stage = Stage.Distributed;

        emit Distributed(batchId, msg.sender, quantityReceived, totalAmountPaid);
    }

    // -------------------- Retailer --------------------
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
        require(retailPurchasePrice > 0 && consumerPrice > 0, "Invalid pricing");

        require(
            keccak256(bytes(p.farmerInfo.cropName)) == keccak256(bytes(cropName)),
            "Crop name mismatch"
        );

        // find distributor
        uint256 distributorIndex = type(uint256).max;
        for (uint256 i = 0; i < p.distributors.length; i++) {
            if (keccak256(bytes(p.distributors[i].distributorName)) == keccak256(bytes(distributorName))) {
                distributorIndex = i;
                break;
            }
        }
        require(distributorIndex != type(uint256).max, "Distributor not found");

        DistributorInfo storage d = p.distributors[distributorIndex];
        require(retailQuantity <= d.remainingQuantity, "Not enough distributor quantity");
        require(
            d.totalAmountPaid * retailQuantity == retailPurchasePrice * d.quantityReceived,
            "Price inconsistent"
        );

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

        d.remainingQuantity -= retailQuantity;
        p.distributorRetailers[d.distributor].push(r);
        p.stage = Stage.Retail;

        emit RetailUpdated(batchId, msg.sender, retailQuantity, retailPurchasePrice);
    }

    // -------------------- Getters --------------------
    function getProduce(bytes32 batchId) public view returns (FarmerInfo memory, DistributorInfo[] memory, Stage) {
        Produce storage p = produceItems[batchId];
        return (p.farmerInfo, p.distributors, p.stage);
    }

    function getFarmerBatches(address farmer) public view returns (bytes32[] memory) {
        return farmerBatches[farmer];
    }

    function getFarmerRemainingQuantity(bytes32 batchId) public view returns (uint256) {
        return produceItems[batchId].farmerInfo.remainingQuantity;
    }

    function getDistributorRemainingQuantity(bytes32 batchId, uint256 distributorIndex) public view returns (uint256) {
        require(produceItems[batchId].distributors.length > distributorIndex, "Invalid distributor index");
        return produceItems[batchId].distributors[distributorIndex].remainingQuantity;
    }

    // ✅ new getter: retailers grouped by distributor
    function getRetailersForDistributor(bytes32 batchId, address distributor)
        public
        view
        returns (RetailInfo[] memory)
    {
        return produceItems[batchId].distributorRetailers[distributor];
    }
}
