import React, { useState } from 'react';

const Support: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to a backend
    console.log('Support request:', { name, email, message });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setEmail('');
      setMessage('');
    }, 3000);
  };

  const faqs = [
    {
      question: 'How do I upload wallpapers?',
      answer: 'Click on "Upload Wallpapers" in the sidebar or use the "Upload New" button on the dashboard. You can select images from your device and add titles before uploading.',
    },
    {
      question: 'What image formats are supported?',
      answer: 'We support JPG, PNG, and WebP formats. Maximum file size is 10MB per image.',
    },
    {
      question: 'How do I organize wallpapers?',
      answer: 'You can create Categories and Collections to organize your wallpapers. Categories are for broad classifications, while Collections are for themed groupings.',
    },
    {
      question: 'Can I delete uploaded wallpapers?',
      answer: 'Yes, go to "All Wallpapers", hover over any wallpaper, and click the delete button. This action is permanent.',
    },
    {
      question: 'How much storage do I have?',
      answer: 'Your storage capacity is shown in the sidebar. By default, you have 10GB of storage space.',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-[1000px] mx-auto flex flex-col gap-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Support / Help</h1>
          <p className="text-slate-500 text-sm mt-1">Get help and find answers to common questions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">mail</span>
              Contact Support
            </h3>
            
            {submitted ? (
              <div className="py-12 text-center">
                <div className="size-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl">check_circle</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">Message Sent!</p>
                <p className="text-slate-500 text-sm mt-1">We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message</label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    placeholder="Describe your issue or question..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-blue-700 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  style={{ color: '#ffffff !important' } as React.CSSProperties}
                >
                  <span className="material-symbols-outlined">send</span>
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">link</span>
                Quick Links
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Documentation', icon: 'description', href: '#' },
                  { label: 'Video Tutorials', icon: 'play_circle', href: '#' },
                  { label: 'API Reference', icon: 'code', href: '#' },
                  { label: 'Community Forum', icon: 'forum', href: '#' },
                ].map((link, index) => (
                  <a 
                    key={index}
                    href={link.href}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">{link.icon}</span>
                    <span className="text-slate-700 font-medium group-hover:text-primary transition-colors">{link.label}</span>
                    <span className="material-symbols-outlined text-slate-300 ml-auto">arrow_forward</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary to-blue-700 rounded-xl p-6" style={{ color: '#ffffff !important' } as React.CSSProperties}>
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-3xl">support_agent</span>
                <div>
                  <h3 className="font-bold">Need Urgent Help?</h3>
                  <p className="text-sm opacity-80">Our support team is available 24/7</p>
                </div>
              </div>
              <button 
                className="w-full bg-white/20 hover:bg-white/30 font-semibold py-2.5 rounded-lg transition-all mt-2 cursor-pointer"
                style={{ color: '#ffffff !important' } as React.CSSProperties}
              >
                Start Live Chat
              </button>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">quiz</span>
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group border border-slate-200 rounded-lg overflow-hidden">
                <summary className="flex items-center justify-between p-4 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                  <span className="font-medium text-slate-900">{faq.question}</span>
                  <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="p-4 text-slate-600 text-sm border-t border-slate-200">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
