import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: string;
  iconColor: string;
  iconBgColor: string;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  isPrimary?: boolean;
  gridSpan?: "full" | "half";
}

export default function FeatureCard({
  icon,
  iconColor,
  iconBgColor,
  title,
  description,
  buttonText,
  onClick,
  isPrimary = false,
  gridSpan = "half"
}: FeatureCardProps) {
  return (
    <motion.div 
      className={`feature-card p-6 bg-dark-lighter rounded-xl border border-dark-lightest
        ${gridSpan === "full" ? "md:col-span-2 lg:col-span-3" : ""}`}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className={`w-12 h-12 rounded-lg ${iconBgColor} flex items-center justify-center mb-4`}
      >
        <i className={`${icon} ${iconColor} text-2xl`}></i>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 mb-4">{description}</p>
      <Button
        onClick={onClick}
        className={`w-full py-2 rounded-lg transition-colors text-white font-medium
          ${isPrimary ? "bg-primary hover:bg-primary-dark" : "bg-dark-lightest hover:bg-dark-lightest/80"}`}
      >
        {buttonText}
      </Button>
    </motion.div>
  );
}
