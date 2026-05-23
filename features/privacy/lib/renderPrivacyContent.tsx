export function renderPrivacyContent(content: string) {
  const blocks = content.trim().split(/\n\n+/).filter(Boolean);

  return blocks.map((block, index) => {
    const trimmed = block.trim();
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={index} className="mt-6 text-base font-bold text-neutral-900">
          {trimmed.slice(3).trim()}
        </h2>
      );
    }

    return <p key={index}>{trimmed}</p>;
  });
}
