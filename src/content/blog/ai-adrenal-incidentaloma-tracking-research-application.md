---
title: "A Web Application for Adrenal Incidentaloma Identification, Tracking, and Management Using Machine Learning"
description: "Research demonstrates AI can identify and track adrenal incidentalomas in radiology reports. Learn how machine learning prevents missed follow-ups and improves outcomes."
seoTitle: "AI for Adrenal Incidentaloma Tracking: Research & Application"
seoDescription: "Research demonstrates AI can identify and track adrenal incidentalomas in radiology reports. Learn how machine learning prevents missed follow-ups and improves outcomes."
author: "Jackson Steinkamp"
publishDate: "2020-09-17"
image: "https://framerusercontent.com/images/28uyK2k4C2SwXhft9PCiFt8MFmc.webp"
featured: false
tags: ["research", "medical-decision-making"]
draft: false
---

**Authors**: Wasif Bala, Jackson Steinkamp, Timothy Feeney, Avneesh Gupta, Abhinav Sharma, Jake Kantrowitz, Nicholas Cordella, James Moses, Frederick Thurston Drake

**Published**: September 2020

**Journal**: Applied Clinical Informatics

**Abstract**: 

**Background** Incidental radiographic findings, such as adrenal nodules, are commonly identified in imaging studies and documented in radiology reports. However, patients with such findings frequently do not receive appropriate follow-up, partially due to the lack of tools for the management of such findings and the time required to maintain up-to-date lists. Natural language processing (NLP) is capable of extracting information from free-text clinical documents and could provide the basis for software solutions that do not require changes to clinical workflows.

**Objectives** In this manuscript we present (1) a machine learning algorithm we trained to identify radiology reports documenting the presence of a newly discovered adrenal incidentaloma, and (2) the web application and results database we developed to manage these clinical findings.

**Methods** We manually annotated a training corpus of 4,090 radiology reports from across our institution with a binary label indicating whether or not a report contains a newly discovered adrenal incidentaloma. We trained a convolutional neural network to perform this text classification task. Over the NLP backbone we built a web application that allows users to coordinate clinical management of adrenal incidentalomas in real time.

**Results** The annotated dataset included 404 positive (9.9%) and 3,686 (90.1%) negative reports. Our model achieved a sensitivity of 92.9% (95% confidence interval: 80.9–97.5%), a positive predictive value of 83.0% (69.9–91.1)%, a specificity of 97.8% (95.8–98.9)%, and an F1 score of 87.6%. We developed a front-end web application based on the model's output.

**Conclusion** Developing an NLP-enabled custom web application for tracking and management of high-risk adrenal incidentalomas is feasible in a resource constrained, safety net hospital. Such applications can be used by an institution's quality department or its primary care providers and can easily be generalized to other types of clinical findings.

[
 Read Full Text On JAMA Network Open   
](https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2796664)
