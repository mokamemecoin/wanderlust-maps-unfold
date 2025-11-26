import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";

const Terms = () => {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 pb-16">
        <div className="container mx-auto px-4 py-8">
          <Button asChild variant="ghost" className="mb-6">
            <Link to="/signup">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna alla Registrazione
            </Link>
          </Button>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl">Termini di Servizio</CardTitle>
              <p className="text-muted-foreground">Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}</p>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h2 className="text-xl font-semibold mb-3">1. Accettazione dei Termini</h2>
              <p className="text-muted-foreground mb-4">
                Utilizzando Miomondo, accetti di essere vincolato da questi termini di servizio. 
                Se non accetti questi termini, ti preghiamo di non utilizzare i nostri servizi.
              </p>

              <h2 className="text-xl font-semibold mb-3">2. Utilizzo del Servizio</h2>
              <p className="text-muted-foreground mb-4">
                Miomondo è una piattaforma per condividere esperienze di viaggio e connettersi con altri viaggiatori. 
                Ti impegni a utilizzare il servizio in modo responsabile e conforme alle leggi applicabili.
              </p>

              <h2 className="text-xl font-semibold mb-3">3. Account Utente</h2>
              <p className="text-muted-foreground mb-4">
                Sei responsabile della sicurezza del tuo account e della riservatezza della tua password. 
                Accetti di notificarci immediatamente in caso di uso non autorizzato del tuo account.
              </p>

              <h2 className="text-xl font-semibold mb-3">4. Contenuti Utente</h2>
              <p className="text-muted-foreground mb-4">
                I contenuti che pubblichi su Miomondo rimangono di tua proprietà. Tuttavia, concedi a Miomondo 
                una licenza per utilizzare, mostrare e distribuire i tuoi contenuti sulla piattaforma.
              </p>

              <h2 className="text-xl font-semibold mb-3">5. Condotta Utente</h2>
              <p className="text-muted-foreground mb-4">
                Ti impegni a non pubblicare contenuti offensivi, illegali o dannosi. 
                Ci riserviamo il diritto di rimuovere contenuti e terminare account che violano questi termini.
              </p>

              <h2 className="text-xl font-semibold mb-3">6. Limitazione di Responsabilità</h2>
              <p className="text-muted-foreground mb-4">
                Miomondo fornisce la piattaforma "così com'è" senza garanzie di alcun tipo. 
                Non siamo responsabili per danni derivanti dall'uso del servizio.
              </p>

              <h2 className="text-xl font-semibold mb-3">7. Modifiche ai Termini</h2>
              <p className="text-muted-foreground mb-4">
                Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. 
                Le modifiche saranno comunicate tramite la piattaforma.
              </p>

              <h2 className="text-xl font-semibold mb-3">8. Contatti</h2>
              <p className="text-muted-foreground mb-4">
                Per domande riguardo questi termini, contattaci tramite la pagina About.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomNavigation />
    </>
  );
};

export default Terms;
