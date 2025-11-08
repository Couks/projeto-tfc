import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      boxShadow: {
        // Sistema de profundidade em camadas
        'layer-0': 'none',
        'layer-1':
          'inset 0 1px 2px #ffffff30, 0 1px 2px #00000030, 0 2px 4px #00000015',
        'layer-2':
          'inset 0 1px 2px #ffffff50, 0 2px 4px #00000030, 0 4px 8px #00000015',
        'layer-3':
          'inset 0 1px 2px #ffffff70, 0 4px 6px #00000030, 0 6px 10px #00000015',
        'layer-4':
          'inset 0 1px 2px #ffffff90, 0 6px 8px #00000030, 0 8px 12px #00000015',
        'layer-5':
          'inset 0 1px 2px #ffffffa0, 0 8px 10px #00000030, 0 10px 14px #00000015',
        // Sistema de sombras internas para tabelas (apenas inset)
        'inner-0': 'none',
        'inner-1': 'inset 0 1px 2px #00000010, inset 0 -1px 2px #ffffff20',
        'inner-2': 'inset 0 2px 4px #00000015, inset 0 -2px 4px #ffffff30',
        'inner-3': 'inset 0 3px 6px #00000020, inset 0 -3px 6px #ffffff40',
        'inner-4': 'inset 0 4px 8px #00000025, inset 0 -4px 8px #ffffff50',
        'inner-5': 'inset 0 5px 10px #00000030, inset 0 -5px 10px #ffffff60',
        // Sombras padrão mantidas para compatibilidade
        DEFAULT:
          'inset 0 1px 2px #ffffff30, 0 1px 2px #00000030, 0 2px 4px #00000015',
        sm: 'inset 0 1px 2px #ffffff30, 0 2px 4px #00000030, 0 4px 8px #00000015',
        md: 'inset 0 1px 2px #ffffff50, 0 4px 6px #00000030, 0 6px 10px #00000015',
        lg: 'inset 0 1px 2px #ffffff70, 0 6px 8px #00000030, 0 8px 12px #00000015',
        xl: 'inset 0 1px 2px #ffffff90, 0 8px 10px #00000030, 0 10px 14px #00000015',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config


