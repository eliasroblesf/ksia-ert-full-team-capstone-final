export interface Scenario {
  id: string;
  name: string;
  location: string;
  description: string;
  roomDetails: string;
  whatHappened: string;
  initialHazards: string[];
  initialCasualties: string;
  paxCount: number;
  evacuatedCount: number;
  actionPrompt: string;
  cascadingInjects: {
    time: number;
    title: string;
    description: string;
    type: 'RADIO' | 'SYSTEM' | 'SECURITY' | 'ENVIRONMENT';
  }[];
}

export const scenarios: Scenario[] = [
  {
    id: 'office_exec',
    name: 'Executive Office & Boardroom Wing',
    location: 'Airport Headquarters Building, Floor 3, East Wing',
    roomDetails: 'Floor 3: Executive Boardroom, CEO Suite, and Central Copy Room',
    description: 'An electrical fire started in the copy and printing room on Floor 3. Thick black plastic smoke is quickly spreading into the main executive hallway. 35 office workers and managers are trying to escape. The office receptionist collapsed near the printer room with severe smoke inhalation and cannot walk. Heat and smoke are beginning to block the primary exit stairs.',
    whatHappened: 'Photocopier electrical short-circuit ignited stacks of paper and toner cartridges. Plastic and office furniture are burning rapidly.',
    initialHazards: [
      'Heavy black toxic smoke in office hallway',
      'High heat spreading into primary exit Stair A',
      'Exposed 230V office electrical cables melting'
    ],
    initialCasualties: '1 Receptionist (Unresponsive from heavy smoke, weak breathing)',
    paxCount: 35,
    evacuatedCount: 18,
    actionPrompt: 'Cut the floor power, protect the injured receptionist, and guide remaining staff down the safe secondary stairwell.',
    cascadingInjects: [
      { 
        time: 180, 
        title: 'Walkie-Talkie Radio Channel Jammed', 
        description: 'Panicked office staff are talking over the emergency radio at the same time. Switch to backup team channel.', 
        type: 'RADIO' 
      },
      { 
        time: 360, 
        title: 'Office Air Conditioning Pushing Smoke', 
        description: 'Smoke is traveling through ceiling ventilation ducts into 4th floor offices. Shut down building HVAC immediately.', 
        type: 'SYSTEM' 
      },
      { 
        time: 600, 
        title: 'Electronic Badge Turnstiles Jammed', 
        description: 'Ground floor security turnstiles lost power and are stuck locked. Manually trigger emergency door release.', 
        type: 'SECURITY' 
      }
    ]
  },
  {
    id: 'office_dispatch',
    name: 'Flight Dispatch & Pilot Briefing Offices',
    location: 'Terminal Operations Building, Floor 2, Corridor B',
    roomDetails: 'Floor 2: Flight Dispatch Control Room, Pilot Briefing Lounge & Equipment Dock',
    description: 'A multi-tablet lithium battery charging station exploded inside the Flight Operations office. Flames caught wooden office desks, carpet, and flight paper manuals. 20 flight dispatchers and airline staff rushed toward the exit in panic. One senior flight dispatcher was burned on his hands and face, and is lying on the carpet unable to breathe.',
    whatHappened: 'Lithium battery thermal runaway on a pilot tablet charging rack caused an explosion and rapid desk fire.',
    initialHazards: [
      'Violent lithium battery pop sparks and toxic chemical gas',
      'Zero visibility smoke filling the flight briefing corridor',
      'Hot burning office documents and synthetic carpet'
    ],
    initialCasualties: '1 Dispatcher (Second-degree facial burns, coughing and disoriented)',
    paxCount: 20,
    evacuatedCount: 12,
    actionPrompt: 'Isolate the power strip, provide urgent burn care and fresh air, and ensure all pilots and dispatchers reach the safe exit.',
    cascadingInjects: [
      { 
        time: 180, 
        title: 'Locked Glass Office Partition', 
        description: 'Keycard reader on the pilot corridor door lost power. Workers are trapped behind glass. Use emergency manual override.', 
        type: 'SECURITY' 
      },
      { 
        time: 360, 
        title: 'Fire Sprinkler Water Touching Floor Sockets', 
        description: 'Sprinklers activated above desks. Water is flooding live 230V computer sockets on the floor.', 
        type: 'SYSTEM' 
      },
      { 
        time: 600, 
        title: 'Delivery Van Blocking Emergency Door', 
        description: 'A mail delivery van is parked directly in front of the outside fire escape door. Move vehicle immediately.', 
        type: 'SECURITY' 
      }
    ]
  },
  {
    id: 'office_security',
    name: 'Aviation Pass & Security Badging Office',
    location: 'Administration Block B, Ground Floor Public Wing',
    roomDetails: 'Ground Floor: ID Card Production Office, Server Closet & Public Waiting Lounge',
    description: 'A power surge blew out the ID card printing server rack, starting a fire behind the counters. Acrid plastic smoke filled the public waiting area where 40 airport staff and visitors were waiting. The electric magnetic doors locked shut when power failed, trapping people inside. An elderly visitor fainted in the crowd and is unresponsive on the floor.',
    whatHappened: 'High-amperage electrical surge destroyed the badge printer server, creating burning plastic fumes and locking magnetic exit doors.',
    initialHazards: [
      'Magnetic security doors stuck in locked position',
      'Poisonous burning plastic and PVC wire insulation fumes',
      'Crowded waiting room with panic and low oxygen'
    ],
    initialCasualties: '1 Visitor (Unresponsive, no breathing detected, cardiac arrest suspected)',
    paxCount: 40,
    evacuatedCount: 15,
    actionPrompt: 'Release the magnetic door interlocks, start immediate CPR with AED defibrillator, and clear the smoky waiting area.',
    cascadingInjects: [
      { 
        time: 180, 
        title: 'Panicking Crowd Banging on Windows', 
        description: 'Visitors in the waiting area are hitting glass partitions. Evacuation lead must give loud, calm verbal instructions.', 
        type: 'SECURITY' 
      },
      { 
        time: 360, 
        title: 'Emergency Hallway Lights Failed', 
        description: 'Backup battery lighting failed in the inner hallway. Use portable flashlights to guide evacuees.', 
        type: 'SYSTEM' 
      },
      { 
        time: 600, 
        title: 'Civil Defense Fire Engine Blocked', 
        description: 'Staff cars parked in the red emergency bay outside. Direct security liaison to clear the roadway for incoming fire trucks.', 
        type: 'ENVIRONMENT' 
      }
    ]
  },
  {
    id: 'office_hr',
    name: 'Human Resources & Finance Office',
    location: 'Airport Administration Tower, Floor 4, North Suite',
    roomDetails: 'Floor 4: Open-Plan Finance Desks, Staff Kitchenette & Records Archive',
    description: 'An electric water boiler and microwave caught fire in the staff kitchenette on Floor 4. Flames reached the overhead wooden cabinets and ceiling tiles. Dense smoke entered the open-plan office where 28 employees were working. A finance officer with chronic asthma collapsed near the hallway and cannot breathe. Several terrified workers are trying to use the passenger elevator.',
    whatHappened: 'Kitchenette appliance electrical failure ignited cabinetry and false ceiling panels, spreading smoke across open desks.',
    initialHazards: [
      'Office workers attempting to use dangerous elevators in fire',
      'Burning ceiling panels falling into the office walking path',
      'Dense kitchen grease and plastic smoke causing choking'
    ],
    initialCasualties: '1 Finance Officer (Severe asthma attack, unconscious from smoke inhalation)',
    paxCount: 28,
    evacuatedCount: 16,
    actionPrompt: 'Stop employees from using elevators, clear the smoke-filled hallway, and apply oxygen/first aid to the asthmatic colleague.',
    cascadingInjects: [
      { 
        time: 180, 
        title: '3 Employees Trapped in Elevator', 
        description: 'Workers pressed the elevator button; elevator stopped between floors 3 and 4. Call building engineering for manual lift rescue.', 
        type: 'SYSTEM' 
      },
      { 
        time: 360, 
        title: 'Stairwell Fire Door Wedged Open', 
        description: 'Someone wedged a trash bin in the emergency exit door, letting smoke enter the main escape stairs. Remove the wedge now!', 
        type: 'ENVIRONMENT' 
      },
      { 
        time: 600, 
        title: 'Missing Accountant in Restroom', 
        description: 'Roll call shows 1 team member missing. Search team confirms worker is disoriented inside Floor 4 restroom.', 
        type: 'SECURITY' 
      }
    ]
  },
  {
    id: 'office_it',
    name: 'Airport IT Systems & AOCC Support Wing',
    location: 'Airport Operations Center, Floor 2 Mezzanine, Tech Wing',
    roomDetails: 'Floor 2M: Systems Support Desks, Battery Backup Room & Network Cabinets',
    description: 'A battery backup unit (UPS) exploded with a loud bang in the IT office storage room, releasing chemical acid fumes and dense smoke. The IT support manager was shocked while attempting to flip the emergency power breaker and collapsed on the floor with no pulse. 18 office technicians are disoriented and need clear evacuation instructions.',
    whatHappened: 'Uninterruptible power supply battery ruptured, causing electrical arc flash, acid leak, and dense chemical smoke.',
    initialHazards: [
      'Exposed live 230V/400V electrical wires at the switchboard',
      'Toxic corrosive battery acid fumes and puddles on office floor',
      'Unconscious colleague in sudden cardiac arrest needing immediate CPR'
    ],
    initialCasualties: '1 IT Manager (Electrical shock victim, pulseless, requires immediate CPR + AED)',
    paxCount: 18,
    evacuatedCount: 8,
    actionPrompt: 'Safely cut breaker without touching live wires, administer 30:2 CPR and AED immediately, and evacuate all technicians.',
    cascadingInjects: [
      { 
        time: 180, 
        title: 'Radio Channel Interference', 
        description: 'High electrical interference near server banks. Switch to direct megaphone or runner communication.', 
        type: 'RADIO' 
      },
      { 
        time: 360, 
        title: 'Corrosive Acid Fumes Entering Office HVAC', 
        description: 'Acid vapor is being sucked into adjacent administrative manager offices. Isolate air intake dampers.', 
        type: 'SYSTEM' 
      },
      { 
        time: 600, 
        title: 'Emergency Exit Door Bar Jammed', 
        description: 'Ground-level fire door push-bar is blocked by cardboard boxes outside. Force open immediately.', 
        type: 'SECURITY' 
      }
    ]
  }
];
