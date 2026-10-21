import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error("[GameVault] erreur d'affichage :", error, info.componentStack);
  }

  override render(): ReactNode {
    const { error } = this.state;
    if (error === null) return this.props.children;

    return (
      <div className="page">
        <section className="state-panel" role="alert">
          <h1>L'affichage a planté</h1>
          <p>Tes jeux sont en sécurité : ils sont enregistrés dans l'API. Seule la page a rencontré un problème.</p>
          <p className="state-hint">
            Détail technique : <code>{error.message}</code>
          </p>
          <div className="detail-actions" style={{ justifyContent: "center", marginTop: "1.5rem" }}>
            <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
              Recharger la page
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => this.setState({ error: null })}>
              Réessayer sans recharger
            </button>
          </div>
        </section>
      </div>
    );
  }
}
