export const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="py-8">{children}</div>
    </div>
  );
};
