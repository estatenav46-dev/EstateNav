'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { HeroFold } from '@/components/HeroFold';
import { TelemetryTicker } from '@/components/TelemetryTicker';
import { DeveloperTrustBanner } from '@/components/DeveloperTrustBanner';
import { WorkspaceEngine } from '@/components/WorkspaceEngine';
import { LeadModal } from '@/components/LeadModal';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { Footer } from '@/components/Footer';
import { Segment, Property } from '@/lib/types';
import { getProperties } from '@/lib/firebase';
import { INITIAL_PROPERTIES } from '@/lib/mockData';

export default function Home() {
  const [currentSegment, setCurrentSegment] = useState<Segment>('residential');
  const [selectedMicroMarket, setSelectedMicroMarket] = useState<string>('All Bengaluru Corridors');
  const [selectedBudget, setSelectedBudget] = useState<string>('Any Budget');
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalProperty, setModalProperty] = useState<Property | null>(null);
  const [modalActionTitle, setModalActionTitle] = useState<string>('Inspect Allocation Deck');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const data = await getProperties(currentSegment);
      if (isMounted) {
        setProperties(data);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [currentSegment]);

  const handleInspectSpotlight = () => {
    const spotlightItem = properties.find((p) => p.isAnchorSpotlight) || properties[0];
    setModalProperty(spotlightItem || null);
    setModalActionTitle('Inspect Allocation Deck');
    setIsModalOpen(true);
  };

  const handleInspectProperty = (property: Property) => {
    setModalProperty(property);
    setModalActionTitle(`Inspect Allocation Deck: ${property.name}`);
    setIsModalOpen(true);
  };

  const handleOpenVipTour = () => {
    setModalProperty(null);
    setModalActionTitle('Schedule Guided VIP Site Visit');
    setIsModalOpen(true);
  };

  const handleUnlockDeveloperPricing = () => {
    setModalProperty(null);
    setModalActionTitle('Unlock Direct Developer Pricing Sheet');
    setIsModalOpen(true);
  };

  const handleScrollToWorkspace = () => {
    const el = document.getElementById('workspace');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-canvas-950 text-slate-100">
      <Header
        currentSegment={currentSegment}
        onSegmentChange={setCurrentSegment}
        onOpenVipModal={handleOpenVipTour}
      />

      <main className="flex-grow">
        <HeroFold
          segment={currentSegment}
          selectedMicroMarket={selectedMicroMarket}
          onMicroMarketChange={setSelectedMicroMarket}
          selectedBudget={selectedBudget}
          onBudgetChange={setSelectedBudget}
          onSearchClick={handleScrollToWorkspace}
          onInspectSpotlight={handleInspectSpotlight}
        />

        <div className="hidden md:block">
          <TelemetryTicker />
        </div>

        <WorkspaceEngine
          properties={properties}
          onInspectProperty={handleInspectProperty}
          initialMicroMarket={selectedMicroMarket}
          initialBudget={selectedBudget}
        />

        <DeveloperTrustBanner
          onUnlockPricing={handleUnlockDeveloperPricing}
        />
      </main>

      <Footer />

      <MobileBottomNav
        onOpenVipModal={handleOpenVipTour}
      />

      <LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedProperty={modalProperty}
        actionTitle={modalActionTitle}
      />
    </div>
  );
}
