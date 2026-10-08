import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Camera, Printer, ArrowRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const scrollToSamples = () => {
    document.getElementById('samples')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Professional Photography Studio
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground max-w-4xl mx-auto leading-tight">
              Turn Your Portrait Into a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-accent">
                3D Avatar
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your memories into unique 3D-printed souvenirs. Upload your photo, customize your avatar, and we'll bring it to life.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                onClick={() => navigate('/create')}
                className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
                style={{ boxShadow: 'var(--shadow-soft)' }}
              >
                Start Creating
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToSamples}
                className="text-lg px-8 py-6 rounded-full"
              >
                View Samples
              </Button>
            </div>

            {/* Prototype Notice */}
            <div className="pt-8">
              <p className="text-sm text-muted-foreground max-w-xl mx-auto px-4 py-3 rounded-lg bg-muted/50 border border-border">
                📸 <strong>Prototype Note:</strong> This demo simulates the avatar generation process. Your uploaded photo will be displayed as the avatar preview while the actual AI processing is under development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Upload Your Photo</h3>
              <p className="text-muted-foreground">
                Simply upload any portrait photo and choose your preferred style and category.
              </p>
            </div>

            <div className="text-center space-y-4 p-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">AI Customization</h3>
              <p className="text-muted-foreground">
                Refine your avatar with natural language. Change colors, styles, and details easily.
              </p>
            </div>

            <div className="text-center space-y-4 p-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Printer className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">3D Print & Deliver</h3>
              <p className="text-muted-foreground">
                Choose your size and material, and we'll 3D print your unique avatar souvenir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Samples Section */}
      <section id="samples" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Sample Avatars</h2>
            <p className="text-muted-foreground">See what you can create with our service</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-gradient-to-br from-muted to-muted/50 animate-pulse"
                style={{
                  boxShadow: 'var(--shadow-card)',
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Camera className="w-12 h-12 opacity-20" />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Sample avatars coming soon. Start creating yours today!
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Create Your Avatar?</h2>
          <p className="text-lg text-muted-foreground">
            Join hundreds of satisfied customers who've turned their photos into amazing 3D keepsakes
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/create')}
            className="text-lg px-8 py-6 rounded-full"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}
