export default function VideoPlayer({ videoUrl }) {
  return (
    <div className="w-full aspect-video mb-4">
      <iframe
        className="w-full h-full rounded"
        src={videoUrl}
        title="Course Video"
        frameBorder="0"
        allowFullScreen
      ></iframe>
    </div>
  );
}
