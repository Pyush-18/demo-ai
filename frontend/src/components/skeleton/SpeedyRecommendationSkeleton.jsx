export const SpeedyRecommendationSkeleton = () => {
  const numRows = 5;
  const skeletonRows = Array.from({ length: numRows });

  return (
    <>
      {skeletonRows.map((_, index) => (
        <tr key={index} className="border-b border-purple-500/10 animate-pulse">
          <td className="px-6 py-4">
            <div className="w-5 h-5 rounded-md bg-purple-800/50"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-purple-800/50 rounded w-10"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-purple-800/50 rounded w-20"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-purple-800/50 rounded w-full max-w-xs"></div>
          </td>

          <td className="px-6 py-4 text-right">
            <div className="h-4 bg-purple-800/50 rounded w-16 ml-auto"></div>
          </td>
          <td className="px-6 py-4 text-right">
            <div className="inline-flex h-6 bg-purple-800/50 rounded-full w-20"></div>
          </td>

          <td className="px-6 py-4">
            <div className="w-8 h-8 rounded-lg bg-purple-800/50"></div>
          </td>
        </tr>
      ))}
    </>
  );
};
