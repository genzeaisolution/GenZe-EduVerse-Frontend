export default function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 animate-fade-in">
      <div className="bg-gradient-to-br from-primary-600 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
        <Icon size={22} className="text-white" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
