import { Sprout } from 'lucide-react';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sprout className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold font-heading">AgriSync</span>
        </div>
        




        
      </div>
    </header>);

}