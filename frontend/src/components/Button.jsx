import { Link } from "react-router-dom";
import clsx from "clsx";

export default function Button({
  children,
  variant = "primary",
  size = "sm",
  leftIcon,
  rightIcon,
  to,
  href,
  target,
  rel,
  customColor,
  className,
  ...props
}) {
  const sizes = {
    xxs: "px-2 -py-2 text-[6px] rounded-md font-light",
    xs: "px-3 py-[2px] text-[10px] rounded-md font-regular",
    sm: "px-4 py-2 text-sm rounded-lg font-medium",
    md: "px-5 py-2.5 text-sm rounded-lg font-medium",
    lg: "px-6 py-3 text-sm rounded-lg font-medium",
  };

  const variants = {
    navbar: `
      bg-primary
      hover:bg-primary_hover
      hover:from-blue-600 hover:to-cyan-600
      text-white
    `,

    primary: `
      bg-primary
      hover:bg-primary_hover
      text-white
    `,

    secondary: `
      border border-primary/40
      text-primary
      hover:bg-primary/10
      bg-white
    `,

    outline: `
      border border-primary
      text-primary
      bg-transparent
      hover:bg-primary
      hover:text-white
    `,

    light_outline: `
      border border-primary
      text-primary
      bg-transparent
      hover:bg-primary
      hover:text-white
    `,

    whatsapp: `
      bg-green-500
      hover:bg-green-600
      text-white
    `,

    phone: `
      bg-white
      border border-blue-100
      text-primary
      hover:bg-blue-50
    `,

    custom: `
      text-white
    `,
  };

  const baseClasses = clsx(
    "inline-flex items-center justify-center gap-2",
    "transition-all duration-200 ease-out",
    "hover:-translate-y-0 active:translate-y-0 active:scale-90",
    "focus:outline-none ring-0 outline-none focus:ring-0 focus:ring-blue-500/15",
    sizes[size],    
    variants[variant],
    className
  );

  const customStyle =
    variant === "custom" && customColor
      ? {
          background: `linear-gradient(135deg, ${customColor}, ${customColor}cc)`,
        }
      : undefined;

  const content = (
    <>
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={baseClasses}
        style={customStyle}
        {...props}
      >
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={baseClasses}
        style={customStyle}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      className={baseClasses}
      style={customStyle}
      {...props}
    >
      {content}
    </button>
  );
}