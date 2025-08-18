export default function ResourceList({ items }) {
  return (
    <ul className="list-disc list-inside space-y-2">
      {items.map((item, index) => (
        <li key={index}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {item.title}
          </a>
        </li>
      ))}
    </ul>
  );
}
