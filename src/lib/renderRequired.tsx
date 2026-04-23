export const renderRequired = (text: string) => {
  return (
    <span>
      {text} <span className="text-red-500">*</span>
    </span>
  )
};