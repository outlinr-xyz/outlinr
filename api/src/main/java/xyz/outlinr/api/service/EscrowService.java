package xyz.outlinr.api.service;

import xyz.outlinr.api.dto.request.*;
import xyz.outlinr.api.dto.response.*;
import xyz.outlinr.api.entity.User;
import xyz.outlinr.api.entity.enumeration.EscrowStatus;

import java.util.List;
import java.util.UUID;

public interface EscrowService {

    EscrowResponse createEscrow(CreateEscrowRequest request, User creator);

    EscrowResponse createAndFundEscrow(CreateEscrowRequest request, User creator, String txnRef, long amountInKobo);

    EscrowResponse getEscrow(UUID id, User currentUser);

    List<EscrowResponse> listEscrows(User currentUser, EscrowStatus statusFilter);

    EscrowResponse transitionStatus(UUID id, StatusTransitionRequest request, User currentUser);

    AuthResult acceptInvite(InviteAcceptRequest request);

    InvitePreviewResponse getInvitePreview(UUID inviteToken);

    void deleteEscrow(UUID id, DeleteEscrowRequest request, User currentUser);
}
