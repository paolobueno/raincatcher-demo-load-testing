'use strict';
module.exports = function makeResult(id, userId, workorderId) {
  return {
    "status": "In Progress",
    "stepResults": {
      "signoff": {
        "step": {
          "code": "signoff",
          "name": "Sign-off Workorder",
          "formId": "56bdf252206b0cba6f35837b"
        },
        "submission": {
          "submissionLocalId": "56bdf252206b0cba6f35837b_submission_1488386032161",
          "formId": "56bdf252206b0cba6f35837b",
          "status": "pending"
        },
        "type": "appform",
        "status": "pending",
        "timestamp": 1488386032239,
        "submitter": "rkX1fdSH"
      },
      "risk-assessment": {
        "step": {
          "code": "risk-assessment",
          "name": "Risk Assessment",
          "templates": {
            "form": "<risk-assessment-form></risk-assessment-form>",
            "view": "<risk-assessment value=\"result.submission\"></risk-assessment>"
          }
        },
        "submission": {
          "complete": true,
          "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVgAAACWCAYAAACb+ZAwAAAFc0lEQVR4Xu3aUW2WQRBA0akDJCABlIAUUAAowAJVBhJAQUkaHkjh9c7LnAqYzZ6d3Hxp/ofxR4AAAQKJwEMy1VACBAgQGIG1BAQIEIgEBDaCNZYAAQICawcIECAQCQhsBGssAQIEBNYOECBAIBIQ2AjWWAIECAisHSBAgEAkILARrLEECBAQWDtAgACBSEBgI1hjCRAgILB2gAABApGAwEawxhIgQEBg7QABAgQiAYGNYI0lQICAwNoBAgQIRAICG8EaS4AAAYG1AwQIEIgEBDaCNZYAAQICawcIECAQCQhsBGssAQIEBNYOECBAIBIQ2AjWWAIECAisHSBAgEAkILARrLEECBAQWDtAgACBSEBgI1hjCRAgILB2gAABApGAwEawxhIgQEBg7QABAgQiAYGNYI0lQICAwNoBAgQIRAICG8EaS4AAAYG1AwQIEIgEBDaCNZYAAQICawcIECAQCQhsBGssAQIEBNYOECBAIBIQ2AjWWAIECAisHSBAgEAkILARrLEECBAQWDtAgACBSEBgI1hjCRAgILB2gAABApGAwEawxhIgQEBg7QABAgQiAYGNYI0lQICAwNoBAgQIRAICG8EaS4AAAYG1AwQIEIgEBDaCNZYAAQICawcIECAQCQhsBGssAQIEBNYOECBAIBIQ2AjWWAIECAisHSBAgEAkILARrLEECBAQWDtAgACBSEBgI1hjCRAgILB2gAABApGAwEawxhIgQEBg7QABAgQiAYGNYI0lQICAwNoBAgQIRAICG8EaS4AAAYG1AwQIEIgEBDaCNZYAAQICawcIECAQCQhsBGssAQIEBNYOECBAIBIQ2AjWWAIECAisHSBAgEAkILARrLEECBAQWDtAgACBSEBgI1hjCRAgILB2gAABApGAwEawxhIgQEBg7QABAgQiAYGNYI0lQICAwNoBAgQIRAICG8EaS4AAAYG1AwQIEIgEBDaCNZYAAQICawcIECAQCQhsBGssAQIEBNYOECBAIBIQ2AjWWAIECAisHSBAgEAkILARrLEECBAQWDtAgACBSEBgI1hjCRAgILB2gAABApGAwEawxhIgQEBg7QABAgQiAYGNYI0lQICAwNoBAgQIRAICG8EaS4AAAYG1AwQIEIgEBDaCNZYAAQICawcIECAQCQhsBGssAQLXBJ5ez8y7mXk1M48zDz8E9toOuC8BAoHAc1y//zX458y8FdiA2kgCBK4JPH2Yma8vbv1RYK/tgfsSIBAIPH2emU8vBn8R2IDaSAIErgn8N7C+YK+tgfsSIFAI/PM/2F8z88YXbGFtJgECBwWeI/v+z68IvvkVwcEVcGUCBPYEfMHuWTuJAIFjAgJ77MFdlwCBPQGB3bN2EgECxwQE9tiDuy4BAnsCArtn7SQCBI4JCOyxB3ddAgT2BAR2z9pJBAgcExDYYw/uugQI7AkI7J61kwgQOCYgsMce3HUJENgTENg9aycRIHBMQGCPPbjrEiCwJyCwe9ZOIkDgmIDAHntw1yVAYE9AYPesnUSAwDEBgT324K5LgMCegMDuWTuJAIFjAgJ77MFdlwCBPQGB3bN2EgECxwQE9tiDuy4BAnsCArtn7SQCBI4JCOyxB3ddAgT2BAR2z9pJBAgcExDYYw/uugQI7AkI7J61kwgQOCYgsMce3HUJENgTENg9aycRIHBMQGCPPbjrEiCwJyCwe9ZOIkDgmIDAHntw1yVAYE9AYPesnUSAwDEBgT324K5LgMCegMDuWTuJAIFjAgJ77MFdlwCBPQGB3bN2EgECxwQE9tiDuy4BAnsCArtn7SQCBI4JCOyxB3ddAgT2BAR2z9pJBAgcExDYYw/uugQI7AkI7J61kwgQOCbwG9GUFDK/3za7AAAAAElFTkSuQmCC"
        },
        "type": "static",
        "status": "complete",
        "timestamp": 1488386042051,
        "submitter": userId
      }
    },
    "workorderId": workorderId,
    "id": id
  };
};
