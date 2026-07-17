// TokenCard component – displays a token as a card with animated entry
import React from "react";
import { motion } from "framer-motion";

type TokenCardProps = {
  token: string;
  index: number;
  onClick?: (index: number) => void;
};

export const TokenCard: React.FC<TokenCardProps> = ({ token, index, onClick }) => {
  return (
    <motion.div
      className="cursor-pointer rounded-xl bg-white/10 backdrop-blur-md p-3 text-center text-lg font-medium text-white shadow-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
      onClick={() => onClick?.(index)}
    >
      {token}
    </motion.div>
  );
};
