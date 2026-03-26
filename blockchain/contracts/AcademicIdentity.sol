// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AcademicIdentity is Ownable {
    struct Certificate {
        string ipfsHash;
        address institution;
        address student;
        uint256 issueDate;
        bool isValid;
    }

    // Mapping from certificate ID (could be a unique hash) to Certificate data
    mapping(bytes32 => Certificate) public certificates;
    
    // Mapping to track authorized institutions
    mapping(address => bool) public authorizedInstitutions;

    event InstitutionAuthorized(address indexed institution);
    event InstitutionDeauthorized(address indexed institution);
    event CertificateIssued(bytes32 indexed certId, string ipfsHash, address indexed institution, address indexed student);
    event CertificateRevoked(bytes32 indexed certId);

    constructor() Ownable(msg.sender) {
        authorizedInstitutions[msg.sender] = true;
    }

    modifier onlyAuthorized() {
        require(authorizedInstitutions[msg.sender], "Not an authorized institution");
        _;
    }

    function authorizeInstitution(address _institution) external onlyOwner {
        authorizedInstitutions[_institution] = true;
        emit InstitutionAuthorized(_institution);
    }

    function deauthorizeInstitution(address _institution) external onlyOwner {
        authorizedInstitutions[_institution] = false;
        emit InstitutionDeauthorized(_institution);
    }

    function issueCertificate(
        bytes32 _certId,
        string memory _ipfsHash,
        address _student
    ) external onlyAuthorized {
        require(!certificates[_certId].isValid, "Certificate already exists");
        
        certificates[_certId] = Certificate({
            ipfsHash: _ipfsHash,
            institution: msg.sender,
            student: _student,
            issueDate: block.timestamp,
            isValid: true
        });

        emit CertificateIssued(_certId, _ipfsHash, msg.sender, _student);
    }

    function revokeCertificate(bytes32 _certId) external onlyAuthorized {
        require(certificates[_certId].isValid, "Certificate does not exist or is already revoked");
        require(certificates[_certId].institution == msg.sender || msg.sender == owner(), "Not authorized to revoke this certificate");
        
        certificates[_certId].isValid = false;
        emit CertificateRevoked(_certId);
    }

    function verifyCertificate(bytes32 _certId) external view returns (
        string memory ipfsHash,
        address institution,
        address student,
        uint256 issueDate,
        bool isValid
    ) {
        Certificate memory cert = certificates[_certId];
        return (cert.ipfsHash, cert.institution, cert.student, cert.issueDate, cert.isValid);
    }
}
