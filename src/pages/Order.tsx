import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/BottomNav';
import { AvatarPreviewCard } from '@/components/AvatarPreviewCard';
import { useAvatar } from '@/contexts/AvatarContext';
import { ArrowLeft, Download, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const sizes = [
  { id: 'small', label: 'Small (10cm)', price: 25 },
  { id: 'medium', label: 'Medium (15cm)', price: 45 },
  { id: 'large', label: 'Large (20cm)', price: 75 },
];

const materials = [
  { id: 'resin', label: 'Resin (Smooth finish)', priceMultiplier: 1 },
  { id: 'pla', label: 'PLA (Eco-friendly)', priceMultiplier: 0.8 },
];

export default function Order() {
  const navigate = useNavigate();
  const { currentAvatar, options, updateOption } = useAvatar();
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!currentAvatar) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">No avatar to order</p>
          <Button onClick={() => navigate('/create')}>Create an Avatar</Button>
        </div>
      </div>
    );
  }

  const selectedSize = sizes.find((s) => s.id === options.size) || sizes[1];
  const selectedMaterial = materials.find((m) => m.id === options.material) || materials[0];
  const totalPrice = selectedSize.price * selectedMaterial.priceMultiplier;

  const handleRequestPrint = () => {
    setShowConfirmation(true);
  };

  const handleDownload3D = () => {
    // MOCK: In production, this would download an actual 3D model file
    toast.info('Mock download: In production, this would download a .stl or .obj file');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/create')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Order Summary</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Avatar Preview */}
        <AvatarPreviewCard avatar={currentAvatar} size="medium" />

        {/* Order Details */}
        <div className="bg-card rounded-2xl p-6 space-y-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h2 className="text-lg font-semibold">Avatar Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium capitalize">{options.category || 'Personal'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base Doll</span>
              <span className="font-medium capitalize">{options.baseDoll || 'Standard'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Background</span>
              <span className="font-medium capitalize">{options.background || 'None'}</span>
            </div>
            {currentAvatar.notes.length > 1 && (
              <div className="pt-2 border-t border-border">
                <span className="text-muted-foreground">Modifications</span>
                <div className="mt-2 space-y-1">
                  {currentAvatar.notes.slice(1).map((note, i) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      • {note.replace('AI Modification: ', '')}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Size Selection */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Select Size</h2>
          <div className="grid grid-cols-3 gap-3">
            {sizes.map((size) => (
              <button
                key={size.id}
                onClick={() => updateOption('size', size.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  options.size === size.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <p className="font-medium text-sm">{size.label.split(' ')[0]}</p>
                <p className="text-xs text-muted-foreground">{size.label.split(' ')[1]}</p>
                <p className="text-primary font-bold mt-1">${size.price}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Material Selection */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Select Material</h2>
          <div className="space-y-2">
            {materials.map((material) => (
              <button
                key={material.id}
                onClick={() => updateOption('material', material.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  options.material === material.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <p className="font-medium">{material.label.split(' ')[0]}</p>
                <p className="text-sm text-muted-foreground">{material.label.split('(')[1]?.replace(')', '')}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-primary/5 rounded-2xl p-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base price</span>
            <span>${selectedSize.price}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Material adjustment</span>
            <span>×{selectedMaterial.priceMultiplier}</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            className="w-full rounded-full"
            size="lg"
            onClick={handleRequestPrint}
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            (Prototype) Request 3D Print
          </Button>

          <Button
            variant="outline"
            className="w-full rounded-full"
            onClick={handleDownload3D}
          >
            <Download className="w-5 h-5 mr-2" />
            Download 3D Preview (Mock)
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Confirmation (Prototype)</DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p>
                <strong>Note:</strong> This is a prototype. In production, this would:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Send your avatar data to our studio ordering system</li>
                <li>Process payment securely</li>
                <li>Generate a 3D printable model file</li>
                <li>Schedule production and delivery</li>
              </ul>
              <p className="text-sm font-medium">
                For now, your avatar has been saved to your history!
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowConfirmation(false)} className="flex-1">
              Close
            </Button>
            <Button
              onClick={() => {
                setShowConfirmation(false);
                toast.success('Avatar saved to history!');
                navigate('/history');
              }}
              className="flex-1"
            >
              View History
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
