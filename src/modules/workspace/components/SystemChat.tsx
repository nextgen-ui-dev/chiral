import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export const SystemChat: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="flex flex-row items-end gap-3">
      <Avatar className="h-8 w-8 bg-white p-[0.5px]">
        <AvatarImage src="/favicon.ico" alt="Chiral AI Icon" />
        <AvatarFallback>CH</AvatarFallback>
      </Avatar>
      <div className="relative max-w-[20rem] whitespace-pre-wrap rounded-lg bg-primary p-2 text-sm">
        <p>{text}</p>
        <div className="absolute -bottom-[3px] -left-[5px] h-0 w-0 -rotate-[30deg] border-b-[5px] border-r-[10px] border-t-[5px] border-primary border-b-transparent border-t-transparent" />
      </div>
    </div>
  );
};
