import React from "react";
import VotingLayout from "../../components/voter/resolution_voting/VotingLayout";

export default function ResolutionVoting() {
  return (
    <>
      <VotingLayout />

      <DigitalSignModal
        open={openSignModal}
        onClose={() => setOpenSignModal(false)}
        onSubmit={(payload: { file: File; password: string }) => {
          console.log("Đã ký số & gửi!", payload);
          setOpenSignModal(false);
        }}
      />
    </>
  );
}
