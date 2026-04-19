// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title FreelanceEscrow
 * @notice Minimal USDC escrow for freelance contracts on Base.
 * @dev Each escrow is identified by an off-chain UUID (as bytes32) so the
 *      on-chain record maps 1-to-1 with our Supabase `orders.id`.
 *
 * Flow:
 *   1. Client calls `fund(id, freelancer, amount)` → transfers USDC into contract.
 *   2. Client calls `release(id)`   → pays freelancer (minus platform fee).
 *   3. Client calls `refund(id)`    → returns funds to client (pre-release only).
 *   4. Arbiter  calls `arbitrate(id, toFreelancer)` → force outcome in disputes.
 *
 * No admin pause / upgrade. The contract is immutable after deploy; arbiter
 * address is configurable at construction but cannot change afterwards.
 */

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool);
}

contract FreelanceEscrow {
    enum Status { None, Funded, Released, Refunded }

    struct Escrow {
        address client;
        address freelancer;
        uint96  amount;        // up to ~79B USDC — plenty
        Status  status;
    }

    IERC20  public immutable usdc;
    address public immutable arbiter;
    address public immutable feeRecipient;
    uint16  public immutable feeBps;      // platform fee in basis points; e.g. 250 = 2.5%

    mapping(bytes32 => Escrow) public escrows;

    event Funded   (bytes32 indexed id, address indexed client,    address indexed freelancer, uint256 amount);
    event Released (bytes32 indexed id, address indexed freelancer, uint256 payout,  uint256 fee);
    event Refunded (bytes32 indexed id, address indexed client,     uint256 amount);
    event Arbitrated(bytes32 indexed id, bool toFreelancer, uint256 payout, uint256 fee);

    error AlreadyFunded();
    error NotFunded();
    error NotAuthorized();
    error BadInput();
    error TransferFailed();

    constructor(address _usdc, address _arbiter, address _feeRecipient, uint16 _feeBps) {
        if (_usdc == address(0) || _arbiter == address(0) || _feeRecipient == address(0)) revert BadInput();
        if (_feeBps > 1000) revert BadInput();    // cap platform fee at 10%
        usdc         = IERC20(_usdc);
        arbiter      = _arbiter;
        feeRecipient = _feeRecipient;
        feeBps       = _feeBps;
    }

    /// @notice Client funds an escrow. Client must `approve` the contract for `amount` first.
    function fund(bytes32 id, address freelancer, uint96 amount) external {
        if (freelancer == address(0) || amount == 0) revert BadInput();
        Escrow storage e = escrows[id];
        if (e.status != Status.None) revert AlreadyFunded();

        e.client     = msg.sender;
        e.freelancer = freelancer;
        e.amount     = amount;
        e.status     = Status.Funded;

        if (!usdc.transferFrom(msg.sender, address(this), amount)) revert TransferFailed();
        emit Funded(id, msg.sender, freelancer, amount);
    }

    /// @notice Client releases funds to freelancer (minus platform fee).
    function release(bytes32 id) external {
        Escrow storage e = escrows[id];
        if (e.status  != Status.Funded) revert NotFunded();
        if (msg.sender != e.client)     revert NotAuthorized();

        (uint256 payout, uint256 fee) = _split(e.amount);
        e.status = Status.Released;

        if (fee > 0 && !usdc.transfer(feeRecipient, fee))  revert TransferFailed();
        if (!usdc.transfer(e.freelancer, payout))           revert TransferFailed();
        emit Released(id, e.freelancer, payout, fee);
    }

    /// @notice Client refunds themselves (only pre-release; freelancer can also voluntarily refund).
    function refund(bytes32 id) external {
        Escrow storage e = escrows[id];
        if (e.status != Status.Funded) revert NotFunded();
        if (msg.sender != e.client && msg.sender != e.freelancer) revert NotAuthorized();

        uint256 amount = e.amount;
        e.status = Status.Refunded;

        if (!usdc.transfer(e.client, amount)) revert TransferFailed();
        emit Refunded(id, e.client, amount);
    }

    /// @notice Arbiter resolves disputed escrows.
    function arbitrate(bytes32 id, bool toFreelancer) external {
        if (msg.sender != arbiter) revert NotAuthorized();
        Escrow storage e = escrows[id];
        if (e.status != Status.Funded) revert NotFunded();

        if (toFreelancer) {
            (uint256 payout, uint256 fee) = _split(e.amount);
            e.status = Status.Released;
            if (fee > 0 && !usdc.transfer(feeRecipient, fee)) revert TransferFailed();
            if (!usdc.transfer(e.freelancer, payout))         revert TransferFailed();
            emit Arbitrated(id, true, payout, fee);
        } else {
            uint256 amount = e.amount;
            e.status = Status.Refunded;
            if (!usdc.transfer(e.client, amount)) revert TransferFailed();
            emit Arbitrated(id, false, amount, 0);
        }
    }

    function _split(uint96 amount) internal view returns (uint256 payout, uint256 fee) {
        fee    = (uint256(amount) * feeBps) / 10_000;
        payout = uint256(amount) - fee;
    }
}
