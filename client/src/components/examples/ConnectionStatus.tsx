import ConnectionStatus from '../ConnectionStatus';

export default function ConnectionStatusExample() {
  return (
    <div className="space-y-4 p-4">
      <ConnectionStatus 
        service="OneDrive" 
        isConnected={true} 
        lastConnection="2 mins ago" 
      />
      <ConnectionStatus 
        service="GitHub" 
        isConnected={false} 
      />
    </div>
  );
}