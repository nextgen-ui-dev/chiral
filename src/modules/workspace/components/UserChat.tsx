export const UserChat: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="mr-4 flex flex-row items-end gap-3 self-end">
      <div className="relative max-w-[20rem] whitespace-pre-wrap rounded-lg bg-white p-2 text-sm text-background">
        <p>{text}</p>
        <div className="absolute -right-[3px] bottom-0 h-0 w-0 rotate-[90deg] border-b-[5px] border-r-[10px] border-t-[5px] border-white border-b-transparent border-t-transparent" />
      </div>
    </div>
  );
};
