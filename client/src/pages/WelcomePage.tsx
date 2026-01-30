import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Cloud, Users, FolderDown, Download, Key, UserPlus } from 'lucide-react';

export function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-telegram-bg overflow-x-hidden safe-area-top safe-area-bottom">
      {/* Navigation - safe area for notched phones */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-telegram-bg/90 backdrop-blur-xl border-b border-telegram-border/50 pt-[env(safe-area-inset-top)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
          <div className="flex justify-between items-center min-h-14 md:min-h-[4.5rem]">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 sm:gap-2.5 hover:opacity-80 transition-opacity min-h-[44px] min-w-[44px] -ml-2 pl-2 rounded-xl active:scale-[0.98]"
              aria-label="Home"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 bg-gradient-to-br from-telegram-accent to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-telegram-accent/20">
                <img src="/TGM.jpg" alt="" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover" />
              </div>
              <span className="text-sm sm:text-base md:text-lg font-semibold text-telegram-text truncate max-w-[140px] xs:max-w-none">Media Saver</span>
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <button type="button" onClick={() => navigate('/login')} className="px-4 py-2.5 text-sm font-medium text-telegram-text-secondary hover:text-telegram-text transition-colors rounded-xl hover:bg-telegram-accent/10 min-h-[44px]">Sign In</button>
              <button type="button" onClick={() => navigate('/register')} className="px-5 py-2.5 text-sm font-medium bg-telegram-accent hover:bg-telegram-accent-hover text-white rounded-xl transition-all shadow-lg shadow-telegram-accent/25 hover:shadow-xl hover:shadow-telegram-accent/30 flex items-center gap-2 min-h-[44px]">Get Started<ArrowRight className="w-4 h-4" /></button>
            </div>
            <div className="flex sm:hidden items-center gap-1.5">
              <button type="button" onClick={() => navigate('/login')} className="px-2.5 py-2 text-xs font-medium text-telegram-text-secondary hover:text-telegram-text transition-colors rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:ring-1 focus-visible:ring-telegram-accent focus-visible:ring-offset-1 focus-visible:ring-offset-telegram-bg">Sign In</button>
              <button type="button" onClick={() => navigate('/register')} className="px-3 py-2 text-xs font-medium bg-telegram-accent hover:bg-telegram-accent-hover text-white rounded-lg transition-all flex items-center gap-1 min-h-[36px] focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:ring-offset-1 focus-visible:ring-offset-telegram-bg">Start<ArrowRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>
      </nav>

      <section className="min-h-[100dvh] sm:min-h-[95vh] md:min-h-screen flex items-center justify-center px-4 pt-[calc(4rem+env(safe-area-inset-top))] pb-10 sm:pt-20 md:pt-0 md:pb-0 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-0 md:left-1/4 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-telegram-accent/15 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 md:right-1/4 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-purple-500/15 rounded-full blur-3xl" />
        </div>
        <div className="container-responsive text-center relative z-10 w-full max-w-2xl py-6 sm:py-10 md:py-16">
          <div className="badge-primary text-xs mb-4 sm:mb-6 md:mb-8 inline-flex">
            <Zap className="w-3 h-3 flex-shrink-0" />
            <span>Fast & Secure Media Downloads</span>
          </div>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-telegram-text mb-3 sm:mb-4 md:mb-6 leading-tight break-words">
            Save TG Media<br /><span className="gradient-text">With One Click</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-telegram-text-secondary max-w-2xl mx-auto mb-3 sm:mb-4 leading-relaxed px-1">Download photos and videos from your channels and groups.</p>
          <p className="text-xs sm:text-sm md:text-base text-telegram-text-muted mb-6 sm:mb-8 md:mb-10">Trusted by <span className="font-semibold text-telegram-accent">200,000+ users</span> worldwide</p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 md:gap-4">
            <button type="button" onClick={() => navigate('/register')} className="btn-primary w-full sm:w-auto text-sm md:text-base px-6 md:px-8 py-3 md:py-4 shadow-glow hover:shadow-xl">Start Saving Media<ArrowRight className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" /></button>
            <button type="button" onClick={() => navigate('/login')} className="btn-secondary w-full sm:w-auto text-sm md:text-base px-6 md:px-8 py-3 md:py-4">I Have an Account</button>
          </div>
          <div className="flex flex-col xs:flex-row flex-wrap items-center justify-center gap-3 sm:gap-6 md:gap-8 mt-8 sm:mt-10 md:mt-14 text-telegram-text-muted">
            <div className="flex items-center gap-2 min-h-[44px]"><Shield className="w-4 h-4 sm:w-5 sm:h-5 text-telegram-success flex-shrink-0" /><span className="text-xs sm:text-sm">Secure & Private</span></div>
            <div className="hidden xs:block w-px h-4 sm:h-5 bg-telegram-border self-stretch" />
            <div className="flex items-center gap-2 min-h-[44px]"><Cloud className="w-4 h-4 sm:w-5 sm:h-5 text-telegram-accent flex-shrink-0" /><span className="text-xs sm:text-sm">Cloud Backup</span></div>
            <div className="hidden xs:block w-px h-4 sm:h-5 bg-telegram-border self-stretch" />
            <div className="flex items-center gap-2 min-h-[44px]"><Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" /><span className="text-xs sm:text-sm">Lightning Fast</span></div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16 md:py-20 px-4 bg-telegram-bg-secondary/50 relative pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <div className="container-responsive">
          <div className="text-center mb-8 sm:mb-10 md:mb-14">
            <span className="badge-primary text-xs mb-3 inline-flex">Features</span>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-telegram-text mb-2 sm:mb-3 md:mb-4">Everything You Need</h2>
            <p className="text-telegram-text-secondary text-sm md:text-base max-w-2xl mx-auto px-1">Powerful features to help you save and manage your Telegram media efficiently</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 stagger-children">
            {[
              { icon: Download, title: 'High Quality Downloads', desc: 'Download photos and videos in their original quality. No compression, no quality loss.', gradient: 'from-telegram-accent to-cyan-500' },
              { icon: Shield, title: 'Private & Secure', desc: 'Your credentials are encrypted and your data stays private. We never store your Telegram password.', gradient: 'from-green-500 to-emerald-500' },
              { icon: Cloud, title: 'Cloud Backup', desc: 'Automatically backup your downloads to the cloud. Access your media from any device.', gradient: 'from-purple-500 to-pink-500' },
              { icon: Users, title: 'Private Channels', desc: 'Access media from private channels and groups you are a member of with full support.', gradient: 'from-orange-500 to-red-500' },
              { icon: Zap, title: 'Bulk Downloads', desc: 'Download multiple files at once with our bulk download feature. Save time and effort.', gradient: 'from-blue-500 to-indigo-500' },
              { icon: FolderDown, title: 'Organized Storage', desc: 'Downloads are automatically organized by chat. Easy to find and manage your media.', gradient: 'from-pink-500 to-rose-500' },
            ].map((feature, index) => (
              <div key={feature.title} className="card-hover p-4 sm:p-5 md:p-6 group min-w-0" style={{ animationDelay: `${index * 100}ms` }}>
                <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                  <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-telegram-text mb-1.5 sm:mb-2">{feature.title}</h3>
                <p className="text-telegram-text-secondary text-sm leading-relaxed break-words">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16 md:py-20 px-4 relative pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <div className="container-responsive">
          <div className="text-center mb-8 sm:mb-10 md:mb-14">
            <span className="badge-primary text-xs mb-3 inline-flex">Simple Process</span>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-telegram-text mb-2 sm:mb-3 md:mb-4">How It Works</h2>
            <p className="text-telegram-text-secondary text-sm md:text-base max-w-2xl mx-auto px-1">Get started in just three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-6 md:gap-8 relative">
            <div className="hidden md:block absolute top-14 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-telegram-accent via-purple-500 to-pink-500" />
            {[
              { step: 1, title: 'Create Account', desc: 'Sign up with your email and create a secure password', icon: UserPlus },
              { step: 2, title: 'Connect Telegram', desc: 'Enter your Telegram API credentials to connect', icon: Key },
              { step: 3, title: 'Start Downloading', desc: 'Browse chats and download any media with one click', icon: Download },
            ].map((item, index) => (
              <div key={item.step} className="flex flex-col items-center text-center gap-4 relative">
                <div className="relative flex-shrink-0 md:mb-6">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${index === 0 ? 'from-telegram-accent to-cyan-500' : index === 1 ? 'from-purple-500 to-pink-500' : 'from-pink-500 to-rose-500'} rounded-2xl flex items-center justify-center shadow-xl mx-auto transform hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-telegram-bg-secondary border-2 border-telegram-accent rounded-full flex items-center justify-center text-xs font-bold text-telegram-accent">{item.step}</div>
                </div>
                <div className="flex-none min-w-0">
                  <h3 className="text-base md:text-lg font-semibold text-telegram-text mb-1 md:mb-2">{item.title}</h3>
                  <p className="text-telegram-text-secondary text-sm max-w-xs mx-auto">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16 md:py-20 px-4 relative overflow-hidden pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <div className="absolute inset-0 bg-gradient-to-r from-telegram-accent/20 via-purple-500/20 to-pink-500/20" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 md:left-1/4 w-48 md:w-64 h-48 md:h-64 bg-telegram-accent/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 md:right-1/4 w-48 md:w-64 h-48 md:h-64 bg-purple-500/30 rounded-full blur-3xl" />
        </div>
        <div className="container-responsive text-center relative z-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-telegram-text mb-3 sm:mb-4">Ready to Save Your Media?</h2>
          <p className="text-telegram-text-secondary text-sm md:text-base mb-5 sm:mb-6 md:mb-8 max-w-xl mx-auto px-1">Join thousands of users who trust us to backup their Telegram media</p>
          <button type="button" onClick={() => navigate('/register')} className="btn-primary w-full sm:w-auto text-sm md:text-base px-6 md:px-8 py-3 shadow-glow">Create Free Account<ArrowRight className="w-4 h-4 flex-shrink-0" /></button>
        </div>
      </section>

      <footer className="py-5 sm:py-6 md:py-8 px-4 glass border-t border-white/5 safe-area-bottom pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <div className="container-responsive flex flex-col sm:flex-row justify-between items-center gap-3 md:gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2 md:gap-3">
            <img src="/TGM.jpg" alt="" className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0 rounded-full object-cover" />
            <span className="font-semibold text-telegram-text text-sm md:text-base">Media Saver</span>
          </div>
          <p className="text-telegram-text-muted text-xs md:text-sm">{new Date().getFullYear()} Save TG. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
