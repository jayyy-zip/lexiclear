/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DocumentUpload } from './components/DocumentUpload';
import { ProcessingView } from './components/ProcessingView';
import { DocumentOverview } from './components/DocumentOverview';
import { HealthScoreCard } from './components/HealthScoreCard';
import { SilentRiskRadar } from './components/SilentRiskRadar';
import { ClauseExplorer } from './components/ClauseExplorer';
import { ClauseXRayModal } from './components/ClauseXRayModal';
import { AskDocumentChat } from './components/AskDocumentChat';
import { ActionChecklist } from './components/ActionChecklist';
import { LawyerPrepKit } from './components/LawyerPrepKit';
import { ImportantDates } from './components/ImportantDates';
import { useDocumentContext } from './services/documentContext';
import { Clause, SilentRisk } from './types/document';

export default function App() {
  const {
    currentDocument,
    isAnalyzing,
    selectedClause,
    selectedRisk,
    selectClause,
    selectRisk
  } = useDocumentContext();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [chatTargetQuestion, setChatTargetQuestion] = useState<string | null>(null);

  const handleOpenUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false);
    setActiveTab('overview');
  };

  const handleSelectRisk = (risk: SilentRisk) => {
    selectRisk(risk);
  };

  const handleSelectClause = (clause: Clause) => {
    selectClause(clause);
  };

  const handleCloseXRay = () => {
    selectRisk(null);
    selectClause(null);
  };

  const handleAskAboutTopic = (topic: string) => {
    setChatTargetQuestion(`What does the contract say regarding: ${topic}?`);
    setActiveTab('ask');
    handleCloseXRay();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Sticky Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={handleOpenUploadModal}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAnalyzing ? (
          <ProcessingView />
        ) : !currentDocument ? (
          <DocumentUpload onUploadSuccess={handleUploadSuccess} />
        ) : (
          <div>
            {activeTab === 'overview' && (
              <DocumentOverview
                document={currentDocument}
                onNavigateTab={tab => setActiveTab(tab)}
              />
            )}

            {activeTab === 'score' && (
              <HealthScoreCard
                score={currentDocument.healthScore}
                onNavigateRisks={() => setActiveTab('risks')}
              />
            )}

            {activeTab === 'risks' && (
              <SilentRiskRadar
                risks={currentDocument.risks}
                clauses={currentDocument.clauses}
                onSelectRisk={handleSelectRisk}
              />
            )}

            {activeTab === 'clauses' && (
              <ClauseExplorer
                clauses={currentDocument.clauses}
                onSelectClause={handleSelectClause}
                onAskAboutClause={handleAskAboutTopic}
              />
            )}

            {activeTab === 'ask' && (
              <AskDocumentChat
                document={currentDocument}
                initialQuestion={chatTargetQuestion}
              />
            )}

            {activeTab === 'checklist' && (
              <ActionChecklist
                items={currentDocument.actionChecklist}
                documentName={currentDocument.metadata.fileName}
              />
            )}

            {activeTab === 'lawyer' && (
              <LawyerPrepKit
                kit={currentDocument.lawyerPrepKit}
                documentName={currentDocument.metadata.fileName}
                documentType={currentDocument.documentType}
              />
            )}

            {activeTab === 'timeline' && (
              <ImportantDates
                timeline={currentDocument.timeline}
                documentName={currentDocument.metadata.fileName}
              />
            )}
          </div>
        )}
      </main>

      {/* Upload Modal (if triggered while a document is loaded) */}
      {isUploadModalOpen && (
        <DocumentUpload
          isModal={true}
          onCloseModal={handleCloseUploadModal}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {/* Clause X-Ray Inspection Modal */}
      {(selectedRisk || selectedClause) && (
        <ClauseXRayModal
          risk={selectedRisk}
          clause={selectedClause}
          onClose={handleCloseXRay}
          onAskAboutClause={handleAskAboutTopic}
        />
      )}

      {/* Persistent Legal Safety Footer */}
      <Footer />
    </div>
  );
}
