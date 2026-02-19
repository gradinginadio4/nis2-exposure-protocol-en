/**
 * NIS2 EXPOSURE PROTOCOL - ENGLISH VERSION
 * Logic for NIS2 Directive compliance assessment
 * Based on Directive (EU) 2022/2555 and Belgian transposition law
 */

// State management
const state = {
    step: 1,
    answers: {
        entitySize: null,
        serviceSensitivity: null,
        digitalInfrastructure: {
            cloud: false,
            mfa: false,
            incidentProcess: false,
            supplyChain: false
        },
        governanceMaturity: null
    }
};

// DOM Elements
const steps = {
    1: document.getElementById('step-1'),
    2: document.getElementById('step-2'),
    3: document.getElementById('step-3'),
    4: document.getElementById('step-4'),
    5: document.getElementById('step-5')
};

const tierBadge = document.getElementById('tier-badge');
const resultContent = document.getElementById('result-content');

/**
 * Navigate to specific step
 * @param {number} stepNumber - Target step
 */
function goToStep(stepNumber) {
    // Hide current step
    Object.values(steps).forEach(step => {
        if (step) step.classList.remove('active');
    });
    
    // Show target step
    if (steps[stepNumber]) {
        steps[stepNumber].classList.add('active');
        state.step = stepNumber;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Handle option selection for steps 1, 2, and 4
 * @param {number} step - Current step number
 * @param {string} value - Selected value
 */
function selectOption(step, value) {
    // Update state based on step
    if (step === 1) {
        state.answers.entitySize = value;
        updateSelectionUI(1, value);
        setTimeout(() => goToStep(2), 300);
    } else if (step === 2) {
        state.answers.serviceSensitivity = value;
        updateSelectionUI(2, value);
        setTimeout(() => goToStep(3), 300);
    } else if (step === 4) {
        state.answers.governanceMaturity = value;
        updateSelectionUI(4, value);
        setTimeout(() => calculateAndShowResults(), 300);
    }
}

/**
 * Update UI to show selected state
 * @param {number} step - Step number
 * @param {string} value - Selected value
 */
function updateSelectionUI(step, value) {
    const stepEl = document.getElementById(`step-${step}`);
    const cards = stepEl.querySelectorAll('.option-card');
    
    cards.forEach(card => {
        if (card.dataset.value === value) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

/**
 * Validate step 3 (checkboxes) and proceed
 */
function validateStep3() {
    // Collect checkbox values
    state.answers.digitalInfrastructure = {
        cloud: document.getElementById('cloud-infra').checked,
        mfa: document.getElementById('mfa-enabled').checked,
        incidentProcess: document.getElementById('incident-process').checked,
        supplyChain: document.getElementById('supply-chain').checked
    };
    
    goToStep(4);
}

/**
 * Go back to previous step
 * @param {number} currentStep - Current step number
 */
function goBack(currentStep) {
    if (currentStep > 1) {
        goToStep(currentStep - 1);
    }
}

/**
 * Calculate exposure tier based on NIS2 logic
 * Returns: 'tier-1' (Low), 'tier-2' (Medium), 'tier-3' (High)
 */
function calculateTier() {
    const { entitySize, serviceSensitivity, digitalInfrastructure, governanceMaturity } = state.answers;
    
    let score = 0;
    
    // Entity size weight (NIS2 scope criteria)
    // Large entities in specific sectors are Essential or Important
    if (entitySize === 'large') score += 3;
    else if (entitySize === 'medium') score += 2;
    else score += 1;
    
    // Service sensitivity (Annex III sectors)
    // Legal/accounting services are explicitly listed in NIS2 Annex III
    if (serviceSensitivity === 'high') score += 3;
    else if (serviceSensitivity === 'medium') score += 2;
    else score += 1;
    
    // Digital infrastructure risk factors
    let infraRisk = 0;
    if (digitalInfrastructure.cloud) infraRisk += 1;
    if (!digitalInfrastructure.mfa) infraRisk += 2; // Lack of MFA is high risk
    if (!digitalInfrastructure.incidentProcess) infraRisk += 2; // No incident process is high risk
    if (digitalInfrastructure.supplyChain) infraRisk += 1;
    
    score += Math.min(infraRisk, 3); // Cap at 3
    
    // Governance maturity (risk mitigation)
    // Higher maturity reduces effective exposure
    let governanceModifier = 0;
    if (governanceMaturity === 'none') governanceModifier = 2;
    else if (governanceMaturity === 'basic') governanceModifier = 1;
    else if (governanceMaturity === 'structured') governanceModifier = -1;
    else if (governanceMaturity === 'iso') governanceModifier = -2;
    
    score += governanceModifier;
    
    // Determine tier
    // Tier 3 (High): Large entities in sensitive sectors with poor governance
    // Tier 2 (Medium): Medium entities or large with good governance
    // Tier 1 (Low): Small entities or those with excellent governance
    
    if (score >= 6) return 'tier-3';
    if (score >= 4) return 'tier-2';
    return 'tier-1';
}

/**
 * Generate results content based on tier
 * @param {string} tier - Calculated tier
 */
function generateResults(tier) {
    const tiers = {
        'tier-1': {
            label: 'Limited Exposure',
            title: 'Level 1: Limited Regulatory Exposure',
            implications: 'Your organization presents reduced exposure to strict NIS2 Directive obligations. However, supply chain vigilance remains essential.',
            obligations: [
                'Basic security obligations under Article 21 of the NIS2 Directive',
                'Proportionate risk management measures relative to organizational scale',
                'Regulatory monitoring through Centre for Cybersecurity Belgium (CCB)'
            ],
            timeline: 'Belgian transposition effective since October 2024. No 24-hour reporting obligation applies to your category, absent major incident.',
            accountability: 'Director liability governed by general corporate law. No specific NIS2 administrative sanctions, but duty of care required.',
            positioning: 'Opportunity to progressively structure cybersecurity governance to anticipate regulatory evolution and reassure stakeholders.'
        },
        'tier-2': {
            label: 'Important Exposure',
            title: 'Level 2: Important Entity - Enhanced Obligations',
            implications: 'Your organization likely falls under the "Important Entity" category per NIS2 Directive Annex III. Specific compliance obligations apply.',
            obligations: [
                'Mandatory reporting of significant incidents to CCB within 24 hours (Article 23)',
                'Implementation of cyber risk management measures (Article 21)',
                'Supply chain security requirements (Article 21)',
                'Periodic compliance audit and measure documentation'
            ],
            timeline: 'Immediate effect since Belgian transposition October 2024. First regulatory assessment expected within 12 months.',
            accountability: 'Enhanced director liability exposure. Administrative sanctions up to 1.4% of worldwide turnover or €7M under Belgian law.',
            positioning: 'Rapid structuring of your ISMS (Information Security Management System) recommended to demonstrate proactive compliance posture.'
        },
        'tier-3': {
            label: 'Critical Exposure',
            title: 'Level 3: High Exposure - Priority Compliance',
            implications: 'Your organization presents high NIS2 Directive exposure, potentially as Essential or high-risk Important Entity. Immediate board action required.',
            obligations: [
                'Mandatory 24-hour incident reporting to CCB for all significant incidents',
                'Annual compliance audit by accredited third party',
                'Stringent security measures: access management, encryption, MFA, continuity planning',
                'Due diligence on critical suppliers and supply chain security',
                'Mandatory documentation of risk management measures'
            ],
            timeline: 'Immediate compliance required. Law of 7 April 2024 applicable. CCB supervisory controls being deployed.',
            accountability: 'Personal director liability exposure. Severe criminal and administrative penalties (up to €10M or 2% of worldwide turnover).',
            positioning: 'NIS2 compliance constitutes a strategic board priority. Structured approach, potentially via ISO 27001 certification, strongly recommended to mitigate legal and operational risk.'
        }
    };
    
    const data = tiers[tier];
    
    // Update badge
    tierBadge.textContent = data.label;
    tierBadge.className = `tier-badge ${tier}`;
    
    // Generate HTML content
    return `
        <div class="result-section">
            <h4>📋 Legal Implications</h4>
            <p><strong>${data.title}</strong></p>
            <p>${data.implications}</p>
        </div>
        
        <div class="result-section">
            <h4>⚖️ Regulatory Obligations</h4>
            <ul>
                ${data.obligations.map(obs => `<li>${obs}</li>`).join('')}
            </ul>
        </div>
        
        <div class="result-section">
            <h4>📅 Enforcement Timeline</h4>
            <p>${data.timeline}</p>
        </div>
        
        <div class="result-section">
            <h4>👔 Board Accountability</h4>
            <p>${data.accountability}</p>
        </div>
        
        <div class="result-section">
            <h4>🎯 Strategic Recommendation</h4>
            <p>${data.positioning}</p>
        </div>
    `;
}

/**
 * Calculate results and display
 */
function calculateAndShowResults() {
    const tier = calculateTier();
    const content = generateResults(tier);
    
    resultContent.innerHTML = content;
    goToStep(5);
}

/**
 * Restart assessment
 */
function restartAssessment() {
    // Reset state
    state.answers = {
        entitySize: null,
        serviceSensitivity: null,
        digitalInfrastructure: {
            cloud: false,
            mfa: false,
            incidentProcess: false,
            supplyChain: false
        },
        governanceMaturity: null
    };
    
    // Reset UI
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    document.querySelectorAll('.checkbox-input').forEach(cb => {
        cb.checked = false;
    });
    
    // Go to step 1
    goToStep(1);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Ensure step 1 is visible
    goToStep(1);
});
