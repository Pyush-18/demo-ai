const TransactionTableSkeleton = ({ rows = 3 }) => {
  const RowSkeleton = () => (
    <tr className="border-b border-purple-500/10 h-16 animate-pulse">
      <td className="px-6 py-4">
        <div className="w-5 h-5 rounded-md bg-purple-800/50"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-12 rounded bg-purple-800/50"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-24 rounded bg-purple-800/50"></div>
      </td>
      <td className="px-6 py-4 max-w-md truncate">
        <div className="h-4 w-full rounded bg-purple-800/50"></div>
      </td>
      <td className="px-6 py-4 max-w-md truncate">
        <div className="h-4 w-full rounded bg-purple-800/50"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-16 rounded bg-purple-800/50"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-5 w-16 rounded-full bg-purple-800/50"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-5 w-20 rounded-full bg-purple-800/50"></div>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-800/50"></div>
          <div className="w-8 h-8 rounded-lg bg-purple-800/50"></div>
        </div>
      </td>
    </tr>
  );

  return (
    <>
      {[...Array(rows)].map((_, index) => (
        <RowSkeleton key={index} />
      ))}
    </>
  );
};

export default TransactionTableSkeleton;
