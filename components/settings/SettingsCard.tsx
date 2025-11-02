export const SettingsCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-50 rounded-xl">{icon}</div>
        <div>
          <h3 className="font-medium text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <span className="text-gray-400 text-sm">›</span>
    </div>
  );
};
