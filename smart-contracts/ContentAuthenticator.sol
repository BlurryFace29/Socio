// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract ContentAuthenticator {

    struct Content {
        string cid;
        address userAddress;
        bytes signature;
    }

    mapping(bytes20 => Content) public contentRecords;

    event ContentStored(bytes indexed signature, string cid, address indexed userAddress, bytes20 indexed verificationId);

    function storeContent(string memory _cid, bytes memory _signature, address _userAddress) public {
        require(_signature.length == 65, "Invalid signature length");
        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(_signature, 0x20))
            s := mload(add(_signature, 0x40))
            v := byte(0, mload(add(_signature, 0x60)))
        }

        if (v < 27) {
            v += 27;
        }

        require(v == 27 || v == 28, "Invalid v value");

        bytes32 messageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n46", _cid)
        );

        address recoveredAddress = ecrecover(messageHash, v, r, s);

        require(recoveredAddress == _userAddress, "Invalid signature");

        bytes32 fullVerificationId = keccak256(abi.encodePacked(_cid, _signature, _userAddress));
        
        bytes20 _verificationId = bytes20(fullVerificationId << 96);

        Content memory newContent = Content({
            cid: _cid,
            userAddress: _userAddress,
            signature: _signature
        });

        contentRecords[_verificationId] = newContent;

        emit ContentStored(_signature, _cid, _userAddress, _verificationId);
    }

    function verifyContent(string memory _cid, bytes memory _signature, address _userAddress) 
        public view returns (bytes20) 
    {
        bytes32 fullVerificationId = keccak256(abi.encodePacked(_cid, _signature, _userAddress));
        bytes20 _verificationId = bytes20(fullVerificationId << 96);
        Content memory storedContent = contentRecords[_verificationId];
        return (keccak256(abi.encodePacked(storedContent.cid)) == keccak256(abi.encodePacked(_cid)) && storedContent.userAddress == _userAddress) 
            ? _verificationId 
            : bytes20(0);
    }


    function getVerificationStatus(bytes20 _verificationId) public view returns (bool) {
        Content memory storedContent = contentRecords[_verificationId];
        return bytes(storedContent.cid).length > 0;
    }

}
