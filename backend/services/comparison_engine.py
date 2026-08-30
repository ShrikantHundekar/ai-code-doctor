"""Comparison Engine - Analyzes and compares review outputs from multiple AI providers"""
from typing import Dict, Any, List, Optional
import difflib


class ComparisonEngine:
    """Multi-AI comparison and synthesis engine."""

    @staticmethod
    def normalize_issue_text(text: str) -> str:
        """Normalize issue title or message for fuzzy matching across models."""
        if not text:
            return ""
        return "".join(c.lower() for c in text if c.isalnum() or c.isspace()).strip()

    @classmethod
    def find_bug_clusters(cls, provider_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Cluster similar bugs across providers to determine agreement and confidence."""
        clusters = []
        total_providers = len(provider_results)

        for pres in provider_results:
            pname = pres.get('provider', 'unknown')
            review = pres.get('review', {})
            bugs = review.get('bugs', [])

            for bug in bugs:
                title = bug.get('title', '')
                line = bug.get('line', 1)
                explanation = bug.get('explanation', '')
                norm_title = cls.normalize_issue_text(title)

                # Check if this bug matches an existing cluster
                matched_cluster = None
                for cluster in clusters:
                    # Match if line number is close and titles share high similarity
                    line_diff = abs(cluster['line'] - line)
                    sim = difflib.SequenceMatcher(None, cluster['norm_title'], norm_title).ratio()
                    if line_diff <= 2 and (sim > 0.45 or norm_title in cluster['norm_title'] or cluster['norm_title'] in norm_title):
                        matched_cluster = cluster
                        break

                if matched_cluster:
                    if pname not in matched_cluster['detectedBy']:
                        matched_cluster['detectedBy'].append(pname)
                        matched_cluster['descriptions'].append({
                            'provider': pname,
                            'title': title,
                            'explanation': explanation,
                            'severity': bug.get('severity', 'medium')
                        })
                else:
                    clusters.append({
                        'title': title,
                        'norm_title': norm_title,
                        'line': line,
                        'detectedBy': [pname],
                        'descriptions': [{
                            'provider': pname,
                            'title': title,
                            'explanation': explanation,
                            'severity': bug.get('severity', 'medium')
                        }]
                    })

        # Calculate confidence for each cluster
        formatted_issues = []
        for c in clusters:
            count = len(c['detectedBy'])
            ratio = count / total_providers if total_providers > 0 else 0

            if count >= 3 or ratio >= 0.9:
                confidence = "High Confidence"
                conf_level = "high"
                msg = f"Detected by {count}/{total_providers} AI providers. Multiple providers independently identified this issue."
            elif count >= 2 or ratio >= 0.5:
                confidence = "Medium Confidence"
                conf_level = "medium"
                msg = f"Detected by {count}/{total_providers} AI providers. Strong cross-model agreement."
            else:
                confidence = "Low Confidence"
                conf_level = "low"
                msg = f"Detected by {count}/{total_providers} AI provider. Specific finding by {c['detectedBy'][0]}."

            # Most common severity
            severities = [d['severity'] for d in c['descriptions']]
            primary_severity = max(set(severities), key=severities.count) if severities else "medium"

            formatted_issues.append({
                "title": c['title'],
                "line": c['line'],
                "confidence": confidence,
                "confidenceLevel": conf_level,
                "detectedBy": c['detectedBy'],
                "providerCount": count,
                "totalProviders": total_providers,
                "message": msg,
                "severity": primary_severity,
                "explanations": c['descriptions']
            })

        # Sort clusters by confidence (High first), then providerCount desc
        conf_order = {"high": 0, "medium": 1, "low": 2}
        formatted_issues.sort(key=lambda x: (conf_order.get(x['confidenceLevel'], 3), -x['providerCount']))
        return formatted_issues

    @classmethod
    def compare_complexity(cls, provider_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Compare computational complexity assessments across providers."""
        time_complexities = {}
        space_complexities = {}

        for pres in provider_results:
            pname = pres.get('provider', 'unknown')
            review = pres.get('review', {})
            complexity = review.get('complexity', {})
            time_complexities[pname] = complexity.get('time', 'Unknown')
            space_complexities[pname] = complexity.get('space', 'Unknown')

        distinct_times = set(time_complexities.values())
        distinct_spaces = set(space_complexities.values())

        disagreement = len(distinct_times) > 1 or len(distinct_spaces) > 1

        return {
            "timeComplexity": time_complexities,
            "spaceComplexity": space_complexities,
            "disagreement": disagreement,
            "message": "Provider disagreement detected on algorithmic complexity. Review the code manually before accepting the recommendation." if disagreement else "All providers agreed on algorithmic complexity."
        }

    @classmethod
    def calculate_agreement_score(cls, provider_results: List[Dict[str, Any]], bug_clusters: List[Dict[str, Any]], complexity_comp: Dict[str, Any]) -> float:
        """Calculate a composite agreement score (0.0 to 1.0) based on scores, bugs, and complexity."""
        if len(provider_results) <= 1:
            return 1.0

        # Score variance
        scores = [r.get('review', {}).get('score', 0) for r in provider_results]
        max_s = max(scores) if scores else 0
        min_s = min(scores) if scores else 0
        score_diff = max_s - min_s
        score_agreement = max(0.0, 1.0 - (score_diff / 100.0))

        # Bug overlap agreement
        total_clusters = len(bug_clusters)
        if total_clusters == 0:
            bug_agreement = 1.0
        else:
            high_med_count = sum(1 for b in bug_clusters if b['confidenceLevel'] in ['high', 'medium'])
            bug_agreement = high_med_count / total_clusters

        # Complexity agreement
        comp_agreement = 0.6 if complexity_comp.get('disagreement') else 1.0

        # Weighted composite agreement
        composite = (0.35 * score_agreement) + (0.45 * bug_agreement) + (0.20 * comp_agreement)
        return round(composite, 2)

    @classmethod
    def determine_best_provider(cls, provider_results: List[Dict[str, Any]], bug_clusters: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Dynamically determine the recommended provider without hardcoded bias."""
        if not provider_results:
            return {"provider": "none", "score": 0, "rationale": "No successful provider results available."}

        if len(provider_results) == 1:
            p = provider_results[0]
            return {
                "provider": p.get('provider'),
                "score": p.get('review', {}).get('score', 0),
                "rationale": f"{p.get('provider', '').capitalize()} was the only provider successfully evaluated."
            }

        # Multi-factor scoring
        provider_scores = {}
        for pres in provider_results:
            pname = pres.get('provider')
            review = pres.get('review', {})
            score = review.get('score', 0)
            bug_count = len(review.get('bugs', []))
            sec_count = len(review.get('securityIssues', []))
            quality = review.get('quality', {})
            avg_quality = sum(quality.values()) / len(quality) if quality else score

            # Evaluated score: comprehensive bug identification + balanced quality scoring + security depth
            evaluation_score = (score * 0.3) + (min(bug_count * 15, 30)) + (min(sec_count * 10, 20)) + (avg_quality * 0.3)
            provider_scores[pname] = {
                "raw_score": score,
                "evaluation_score": evaluation_score,
                "bug_count": bug_count,
                "sec_count": sec_count,
                "avg_quality": avg_quality,
                "fixed_code": review.get('fixedCode', '')
            }

        # Pick best provider dynamically
        best_provider_name = max(provider_scores, key=lambda k: provider_scores[k]["evaluation_score"])
        best_data = provider_scores[best_provider_name]

        # Generate rationale dynamically from data
        rationale_parts = []
        if best_data['bug_count'] > 0:
            rationale_parts.append(f"identified {best_data['bug_count']} issue(s)")
        if best_data['sec_count'] > 0:
            rationale_parts.append(f"provided detailed security analysis ({best_data['sec_count']} check(s))")
        rationale_parts.append(f"achieved a {best_data['raw_score']}/100 quality score with balanced maintainability and performance recommendations")

        rationale = f"{best_provider_name.capitalize()} was selected because it " + ", ".join(rationale_parts) + "."

        return {
            "provider": best_provider_name,
            "score": best_data['raw_score'],
            "rationale": rationale
        }

    @classmethod
    def synthesize_comparison(cls, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Perform full comparison across all successful provider results."""
        successful_results = [r for r in results if r.get('success')]

        if not successful_results:
            return {
                "bestProvider": None,
                "averageScore": 0,
                "agreement": 0.0,
                "agreementPercentage": 0,
                "summary": "All providers failed to analyze the code.",
                "recommendation": "Unable to complete comparison. Please retry.",
                "bugClusters": [],
                "complexityComparison": {"timeComplexity": {}, "spaceComplexity": {}, "disagreement": False},
                "scoreComparison": {},
                "bugCountComparison": {},
                "securityComparison": {},
                "suggestedFixes": {}
            }

        # Comparisons
        scores = {r['provider']: r['review'].get('score', 0) for r in successful_results}
        avg_score = round(sum(scores.values()) / len(scores)) if scores else 0
        bug_counts = {r['provider']: len(r['review'].get('bugs', [])) for r in successful_results}
        sec_counts = {r['provider']: len(r['review'].get('securityIssues', [])) for r in successful_results}
        fixes = {r['provider']: r['review'].get('fixedCode', '') for r in successful_results}

        bug_clusters = cls.find_bug_clusters(successful_results)
        complexity_comp = cls.compare_complexity(successful_results)
        agreement = cls.calculate_agreement_score(successful_results, bug_clusters, complexity_comp)
        best_rec = cls.determine_best_provider(successful_results, bug_clusters)

        agreement_pct = int(agreement * 100)
        summary = f"{len(successful_results)} AI provider(s) analyzed the code. Overall agreement is {agreement_pct}% with an average score of {avg_score}/100."

        return {
            "bestProvider": best_rec["provider"],
            "bestScore": best_rec["score"],
            "recommendation": best_rec["rationale"],
            "averageScore": avg_score,
            "agreement": agreement,
            "agreementPercentage": agreement_pct,
            "summary": summary,
            "bugClusters": bug_clusters,
            "complexityComparison": complexity_comp,
            "scoreComparison": scores,
            "bugCountComparison": bug_counts,
            "securityComparison": sec_counts,
            "suggestedFixes": fixes
        }
