import React from 'react';

export function Footer() {
    return (
        <footer className="bg-card border-t border-border mt-auto py-6">
            <div className="container mx-auto px-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                    Desenvolvido pelos alunos do ICMC:
                </p>
                <p className="text-sm font-medium text-foreground mb-4">
                    Arthur Correa • Eduardo Rodrigues • Murilo Rossi • Vinicius Paiva • Vitor Zago
                </p>
                <p className="text-xs text-muted-foreground">
                    para a disciplina SSC0536 - Projeto e Desenvolvimento de Sistemas de Informação (2025)
                </p>
            </div>
        </footer>
    );
}
