'use strict';

module.exports = {
  createNew: createNew,
  updateInProgress: updateInProgress,
  updateComplete: updateComplete
};

function createNew(localuid) {
  return {
    "status": "New"
  };
}

function updateInProgress(id, userId, workorderId) {
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
}

function updateComplete(id, userId, workorderId) {
  return {
    "status": "Complete",
    "stepResults": {
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
          "signature": "data:image/png;base64,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"
        },
        "type": "static",
        "status": "complete",
        "timestamp": 1488474389890,
        "submitter": userId
      },
      "vehicle-inspection": {
        "step": {
          "code": "vehicle-inspection",
          "name": "Vehicle Inspection",
          "templates": {
            "form": "<vehicle-inspection-form></vehicle-inspection-form>",
            "view": "<vehicle-inspection value=\"result.submission\"></vehicle-inspection>"
          }
        },
        "submission": {
          "tires": true,
          "lights": true,
          "fuel": 25
        },
        "type": "static",
        "status": "complete",
        "timestamp": 1488474394862,
        "submitter": userId
      }
    },
    "workorderId": workorderId,
    "id": id
  };
}
