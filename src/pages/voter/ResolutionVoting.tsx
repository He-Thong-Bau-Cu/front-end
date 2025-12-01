import React, { useState } from "react";
import VotingLayout from "../../components/voter/resolution_voting/VotingLayout";
import DigitalSignModal from "../digitalSignature/DigitalSignModal";

export default function ResolutionVoting() {
  const [openSignModal, setOpenSignModal] = useState(false);

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
