import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";

const Privacy = () => {
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
              <CardTitle className="text-3xl">Privacy Policy</CardTitle>
              <p className="text-muted-foreground">Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}</p>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h2 className="text-xl font-semibold mb-3">1. Raccolta Dati</h2>
              <p className="text-muted-foreground mb-4">
                Raccogliamo informazioni che ci fornisci direttamente, come nome, email e contenuti che pubblichi. 
                Raccogliamo anche dati di utilizzo per migliorare il servizio.
              </p>

              <h2 className="text-xl font-semibold mb-3">2. Utilizzo dei Dati</h2>
              <p className="text-muted-foreground mb-4">
                Utilizziamo i tuoi dati per:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Fornire e migliorare i nostri servizi</li>
                <li>Personalizzare la tua esperienza</li>
                <li>Comunicare con te riguardo il servizio</li>
                <li>Garantire la sicurezza della piattaforma</li>
              </ul>

              <h2 className="text-xl font-semibold mb-3">3. Condivisione Dati</h2>
              <p className="text-muted-foreground mb-4">
                Non vendiamo i tuoi dati personali a terzi. Possiamo condividere dati con:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Provider di servizi che ci aiutano a gestire la piattaforma</li>
                <li>Autorità legali quando richiesto dalla legge</li>
                <li>Altri utenti (solo le informazioni che scegli di rendere pubbliche)</li>
              </ul>

              <h2 className="text-xl font-semibold mb-3">4. Sicurezza dei Dati</h2>
              <p className="text-muted-foreground mb-4">
                Implementiamo misure di sicurezza per proteggere i tuoi dati. Utilizziamo crittografia, 
                accesso limitato ai dati e monitoraggio costante per garantire la sicurezza.
              </p>

              <h2 className="text-xl font-semibold mb-3">5. Cookie e Tecnologie Simili</h2>
              <p className="text-muted-foreground mb-4">
                Utilizziamo cookie e tecnologie simili per migliorare l'esperienza utente, 
                ricordare le tue preferenze e analizzare l'utilizzo della piattaforma.
              </p>

              <h2 className="text-xl font-semibold mb-3">6. I Tuoi Diritti</h2>
              <p className="text-muted-foreground mb-4">
                Hai il diritto di:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Accedere ai tuoi dati personali</li>
                <li>Correggere dati inesatti</li>
                <li>Richiedere la cancellazione dei tuoi dati</li>
                <li>Opporti al trattamento dei tuoi dati</li>
                <li>Esportare i tuoi dati</li>
              </ul>

              <h2 className="text-xl font-semibold mb-3">7. Dati dei Minori</h2>
              <p className="text-muted-foreground mb-4">
                Il nostro servizio non è destinato a minori di 18 anni. Non raccogliamo 
                consapevolmente dati personali da minori.
              </p>

              <h2 className="text-xl font-semibold mb-3">8. Modifiche alla Privacy Policy</h2>
              <p className="text-muted-foreground mb-4">
                Possiamo aggiornare questa policy periodicamente. Ti informeremo di modifiche 
                significative tramite email o notifica sulla piattaforma.
              </p>

              <h2 className="text-xl font-semibold mb-3">9. Contatti</h2>
              <p className="text-muted-foreground mb-4">
                Per domande sulla privacy o per esercitare i tuoi diritti, contattaci tramite la pagina About.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomNavigation />
    </>
  );
};

export default Privacy;
