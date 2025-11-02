import { Trash2 } from "lucide-react";

export const DeleteAccountButton = () => {
  return (
    <button className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
      <Trash2 size={18} />
      Delete Account
    </button>
  );
};
