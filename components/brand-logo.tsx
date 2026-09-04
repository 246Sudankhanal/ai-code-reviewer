import Image from "next/image";
import { APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  size = 32,
  className,
  priority = false,
}: BrandLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt={APP_NAME}
      width={size}
      height={size}
      priority={priority}
      className={cn("object-contain", className)}
    />
  );
}
