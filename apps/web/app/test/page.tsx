export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          ✅ Deployment Working!
        </h1>
        <p className="text-gray-600">
          Build successful - Firebase SSR and QRCode issues resolved
        </p>
        <div className="mt-4 text-sm text-gray-500">
          Commit: 5a79593a49f39cd132b8ea1d0173cb2392438bb2
        </div>
      </div>
    </div>
  );
}