import { 
    PT_Sans, Roboto, Lato, Montserrat, Oswald, Playfair_Display, Merriweather, 
    Lobster, Pacifico, Inconsolata, Dancing_Script, Poppins, Nunito_Sans, Raleway, 
    Rubik, Work_Sans, Lora, Cormorant_Garamond, Bitter, Arvo, Anton, Bebas_Neue, 
    Alfa_Slab_One, Caveat, Satisfy, Sacramento, JetBrains_Mono 
} from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/layout/providers';
import { ClientLayout } from '@/components/layout/client-layout';

// Existing Fonts
const ptSans = PT_Sans({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-pt-sans' });
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-roboto' });
const lato = Lato({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-lato' });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-montserrat' });
const oswald = Oswald({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-oswald' });
const playfairDisplay = Playfair_Display({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-playfair-display' });
const merriweather = Merriweather({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-merriweather' });
const lobster = Lobster({ subsets: ['latin'], weight: ['400'], variable: '--font-lobster' });
const pacifico = Pacifico({ subsets: ['latin'], weight: ['400'], variable: '--font-pacifico' });
const inconsolata = Inconsolata({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-inconsolata' });
const dancingScript = Dancing_Script({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-dancing-script' });

// New Fonts
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-poppins' });
const nunitoSans = Nunito_Sans({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-nunito-sans' });
const raleway = Raleway({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-raleway' });
const rubik = Rubik({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-rubik' });
const workSans = Work_Sans({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-work-sans' });
const lora = Lora({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-lora' });
const cormorantGaramond = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-cormorant-garamond' });
const bitter = Bitter({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-bitter' });
const arvo = Arvo({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-arvo' });
const anton = Anton({ subsets: ['latin'], weight: ['400'], variable: '--font-anton' });
const bebasNeue = Bebas_Neue({ subsets: ['latin'], weight: ['400'], variable: '--font-bebas-neue' });
const alfaSlabOne = Alfa_Slab_One({ subsets: ['latin'], weight: ['400'], variable: '--font-alfa-slab-one' });
const caveat = Caveat({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-caveat' });
const satisfy = Satisfy({ subsets: ['latin'], weight: ['400'], variable: '--font-satisfy' });
const sacramento = Sacramento({ subsets: ['latin'], weight: ['400'], variable: '--font-sacramento' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-jetbrains-mono' });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Co & Cu</title>
        <meta name="description" content="Your one-stop online marketplace." />
      </head>
      <body className={cn(
          'min-h-screen bg-background font-body antialiased flex flex-col', 
          ptSans.variable, roboto.variable, lato.variable, montserrat.variable, 
          oswald.variable, playfairDisplay.variable, merriweather.variable, 
          lobster.variable, pacifico.variable, inconsolata.variable, dancingScript.variable,
          poppins.variable, nunitoSans.variable, raleway.variable, rubik.variable,
          workSans.variable, lora.variable, cormorantGaramond.variable, bitter.variable,
          arvo.variable, anton.variable, bebasNeue.variable, alfaSlabOne.variable,
          caveat.variable, satisfy.variable, sacramento.variable, jetbrainsMono.variable
        )}>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
