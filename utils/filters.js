function applyFiltersToEvaluation(evaluation, filters) {
  const { rules, results, levels } = filters;

  if (rules) {
    applyRulesFilter(evaluation, rules);
  }

  if (results) {
    applyResultsFilter(evaluation, results);
  }

  if (levels) {
    applyLevelsFilter(evaluation, levels);
  }

  return evaluation;
}

function applyRulesFilter(evaluation, rules) {
  if (!rules.act) {
    evaluation.actRules.assertions = [];
  }

  if (!rules.wcag) {
    evaluation.wcagTechniques.assertions = [];
  }
}

function applyResultsFilter(evaluation, results) {
  const { passed, warning, failed, inapplicable } = results;

  evaluation.actRules.assertions = evaluation.actRules.assertions.filter(
    (assertion) => {
      const { outcome } = assertion.metadata;
      return (
        (passed && outcome === 'passed') ||
        (warning && outcome === 'warning') ||
        (failed && outcome === 'failed') ||
        (inapplicable && outcome === 'inapplicable')
      );
    },
  );

  evaluation.wcagTechniques.assertions =
    evaluation.wcagTechniques.assertions.filter((assertion) => {
      const { outcome } = assertion.metadata;
      return (
        (passed && outcome === 'passed') ||
        (warning && outcome === 'warning') ||
        (failed && outcome === 'failed') ||
        (inapplicable && outcome === 'inapplicable')
      );
    });
}

function applyLevelsFilter(evaluation, levels) {
  const { a, aa, aaa, others } = levels;

  evaluation.actRules.assertions = evaluation.actRules.assertions.filter(
    (assertion) => {
      const { 'success-criteria': successCriteria } = assertion.metadata;
      if (others && successCriteria.length === 0) {
        return true;
      }
      return successCriteria.some((criteria) => {
        return (
          (a && criteria.level === 'A') ||
          (aa && criteria.level === 'AA') ||
          (aaa && criteria.level === 'AAA') ||
          (others && ['A', 'AA', 'AAA'].includes(criteria.level) === false)
        );
      });
    },
  );

  evaluation.wcagTechniques.assertions =
    evaluation.wcagTechniques.assertions.filter((assertion) => {
      const { 'success-criteria': successCriteria } = assertion.metadata;
      if (others && successCriteria.length === 0) {
        return true;
      }
      return successCriteria.some((criteria) => {
        return (
          (a && criteria.level === 'A') ||
          (aa && criteria.level === 'AA') ||
          (aaa && criteria.level === 'AAA') ||
          (others && ['A', 'AA', 'AAA'].includes(criteria.level) === false)
        );
      });
    });
}

module.exports = {
  applyFiltersToEvaluation,
};
