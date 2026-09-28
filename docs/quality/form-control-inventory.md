# Form control source inventory

Snapshot: 2026-09-28. Static JSX declarations under src, excluding tests and test-utils. Counts include shared primitive definitions and conditional controls; they are not the number of mounted fields or unique business fields. Dynamic arrays are counted once at their declaration. ColorPicker is one field per use, not one field per swatch.

Forms: 23. Control declarations: 223. Shared ConfirmDialog uses: 32. Direct masked/formatted declarations: 57. Formatting count includes DatePickerInput/TimeInput and explicit formatting handlers; formatting delegated through props is not counted twice.

| File | Line | Control | ID/name | Placeholder/prompt prop | Autocomplete | Direct formatting |
| --- | ---: | --- | --- | --- | --- | --- |
| src/components/common/DatePickerInput.tsx | 141 | input | {name} | — | — | — |
| src/components/common/DatePickerInput.tsx | 142 | input | {id} | "DD/MM/AAAA" | — | — |
| src/components/common/FormField.tsx | 54 | input | — | — | — | — |
| src/components/common/FormField.tsx | 68 | TextInput | — | — | — | — |
| src/components/common/FormField.tsx | 79 | textarea | — | — | — | — |
| src/components/common/ListToolbar.tsx | 77 | input | — | {searchPlaceholder} | — | — |
| src/components/common/ListToolbar.tsx | 142 | Select | — | — | — | — |
| src/components/common/MonthPickerInput.tsx | 138 | input | {id} | {placeholder} | — | — |
| src/components/common/Pagination.tsx | 52 | Select | — | — | — | — |
| src/components/common/PasswordInput.tsx | 36 | input | — | — | — | — |
| src/components/common/PasswordResetModal.tsx | 125 | PasswordInput | {newPasswordId} | "Digite a nova senha" | "new-password" | — |
| src/components/common/PasswordResetModal.tsx | 139 | PasswordInput | {confirmPasswordId} | "Confirme a nova senha" | "new-password" | — |
| src/components/common/UserIdentityFields.tsx | 34 | TextInput | {firstNameId} | "Ana" | "off" | — |
| src/components/common/UserIdentityFields.tsx | 48 | TextInput | {lastNameId} | "Martins" | "off" | — |
| src/components/common/UserIdentityFields.tsx | 70 | TextInput | {`${fieldPrefix}email`} | "ana@clinica.com.br" | "off" | — |
| src/components/common/UserIdentityFields.tsx | 96 | TextInput | {fieldId} | "(11) 99999-9999" | "off" | Yes |
| src/features/admin/components/ClinicFormModal.tsx | 142 | TextInput | "clinicName" | "Ex: Clínica DentalFlow" | — | — |
| src/features/admin/components/ClinicFormModal.tsx | 154 | Select | — | — | — | — |
| src/features/admin/components/UserFormModal.tsx | 292 | PasswordInput | "password" | "Crie uma senha inicial" | "new-password" | — |
| src/features/admin/components/UserFormModal.tsx | 313 | Select | — | — | — | — |
| src/features/admin/components/UserFormModal.tsx | 345 | Select | — | — | — | — |
| src/features/admin/components/UserFormModal.tsx | 379 | Select | — | — | — | — |
| src/features/admin/containers/AdminFinancePageContainer.tsx | 545 | TextInput | "subscriptionSearch" | "Nome da clínica..." | — | — |
| src/features/admin/containers/AdminFinancePageContainer.tsx | 554 | Select | — | — | — | — |
| src/features/admin/containers/AdminFinancePageContainer.tsx | 577 | Select | — | — | — | — |
| src/features/admin/containers/AdminFinancePageContainer.tsx | 597 | DatePickerInput | "subscriptionTo" | — | — | Yes |
| src/features/admin/containers/AdminFinancePageContainer.tsx | 778 | TextInput | "stripeEventType" | "customer.subscription.updated..." | — | — |
| src/features/admin/containers/AdminFinancePageContainer.tsx | 787 | Select | — | — | — | — |
| src/features/admin/containers/AdminFinancePageContainer.tsx | 807 | DatePickerInput | "stripeEventTo" | — | — | Yes |
| src/features/auth/components/AuthForm.tsx | 209 | AuthTextField | "clinicName" | "Clínica DentalFlow" | "organization" | — |
| src/features/auth/components/AuthForm.tsx | 223 | AuthTextField | "responsibleName" | "Nome completo" | "name" | — |
| src/features/auth/components/AuthForm.tsx | 240 | AuthTextField | "email" | "contato@clinica.com.br" | "email" | — |
| src/features/auth/components/AuthForm.tsx | 256 | AuthTextField | "password" | {isLogin ? 'Sua senha' : 'Crie uma senha segura'} | {isLogin ? 'current-password' : 'new-password'} | — |
| src/features/auth/components/AuthForm.tsx | 298 | input | {termsCheckboxId} | — | — | — |
| src/features/auth/components/AuthTextField.tsx | 60 | PasswordInput | {name} | {placeholder} | {autoComplete} | — |
| src/features/auth/components/AuthTextField.tsx | 94 | input | {name} | {placeholder} | {autoComplete} | — |
| src/features/auth/pages/CompleteProfilePage.tsx | 125 | AuthTextField | "clinicName" | "Clínica DentalFlow" | "organization" | — |
| src/features/auth/pages/CompleteProfilePage.tsx | 139 | AuthTextField | "responsibleName" | "Nome completo" | "name" | — |
| src/features/auth/pages/CompleteProfilePage.tsx | 157 | input | {termsCheckboxId} | — | — | — |
| src/features/auth/pages/ForgotPasswordPage.tsx | 93 | TextInput | "forgot-email" | "contato@clinica.com.br" | "email" | — |
| src/features/auth/pages/ResetPasswordPage.tsx | 143 | PasswordInput | "new-password" | "Crie uma senha segura" | "new-password" | — |
| src/features/auth/pages/ResetPasswordPage.tsx | 167 | PasswordInput | "confirm-password" | "Repita a nova senha" | "new-password" | — |
| src/features/clinical-records/components/ClinicalSectionField.tsx | 57 | textarea | {fieldId} | {readOnly ? undefined : placeholder} | — | — |
| src/features/clinical-records/components/ImageAttachmentPanel.tsx | 277 | input | — | — | — | — |
| src/features/clinical-records/components/ImageAttachmentPanel.tsx | 293 | input | — | — | — | — |
| src/features/clinical-records/components/ImageAttachmentPanel.tsx | 579 | input | — | {readOnly ? '—' : 'Adicionar legenda...'} | — | — |
| src/features/clinical-records/components/odontogram/OdontogramToothDetailsPanel.tsx | 104 | textarea | {notesId} | {readOnly ? undefined : 'Observações clínicas específicas deste dente...'} | — | — |
| src/features/clinical-records/components/OdontogramSection.tsx | 205 | textarea | {odontogramNotesId} | {readOnly ? undefined : 'Observações gerais sobre o odontograma...'} | — | — |
| src/features/clinical-records/components/VoiceDictationCard.tsx | 1016 | input | — | — | — | — |
| src/features/clinical-records/components/VoiceDictationCard.tsx | 1068 | textarea | — | {`Revise o texto de ${CLINICAL_FIELD_LABELS[key].toLowerCase()}`} | — | — |
| src/features/clinical-records/components/VoiceDictationCard.tsx | 1117 | input | — | — | — | — |
| src/features/clinical-records/components/VoiceDictationCard.tsx | 1135 | textarea | — | "Observação clínica..." | — | — |
| src/features/clinical-records/containers/ClinicalRecordsListContainer.tsx | 259 | TextInput | "clinicalSearch" | "Paciente, profissional, queixa..." | — | — |
| src/features/clinical-records/containers/ClinicalRecordsListContainer.tsx | 270 | Select | — | — | — | — |
| src/features/compliance/components/AuditLogsTab.tsx | 90 | Select | — | — | — | — |
| src/features/compliance/components/AuditLogsTab.tsx | 106 | DatePickerInput | — | "Data inicial" | — | Yes |
| src/features/compliance/components/AuditLogsTab.tsx | 112 | DatePickerInput | — | "Data final" | — | Yes |
| src/features/compliance/components/CookieConsentLogsTab.tsx | 100 | Select | — | — | — | — |
| src/features/compliance/components/CookieConsentLogsTab.tsx | 113 | input | — | — | — | — |
| src/features/compliance/components/CookieConsentLogsTab.tsx | 121 | input | — | — | — | — |
| src/features/compliance/components/PrivacyRequestsTab.tsx | 64 | input | — | "Buscar por código, e-mail ou nome..." | — | — |
| src/features/compliance/components/PrivacyRequestsTab.tsx | 73 | Select | — | — | — | — |
| src/features/compliance/components/PrivacyRequestsTab.tsx | 91 | Select | — | — | — | — |
| src/features/finance/components/CategoryCreateForm.tsx | 53 | Select | — | — | — | — |
| src/features/finance/components/CategoryCreateForm.tsx | 67 | TextInput | "catName" | "Ex.: Marketing, Equipamentos..." | — | — |
| src/features/finance/components/CategoryCreateForm.tsx | 84 | ColorPicker | — | — | — | — |
| src/features/finance/components/CategoryEditModal.tsx | 72 | Select | — | — | — | — |
| src/features/finance/components/CategoryEditModal.tsx | 87 | TextInput | "editCatName" | "Ex.: Marketing, Equipamentos..." | — | — |
| src/features/finance/components/CategoryEditModal.tsx | 99 | ColorPicker | — | — | — | — |
| src/features/finance/components/FinanceFiltersBar.tsx | 48 | DatePickerInput | "financeFrom" | — | — | Yes |
| src/features/finance/components/FinanceFiltersBar.tsx | 55 | DatePickerInput | "financeTo" | — | — | Yes |
| src/features/finance/components/FinanceFiltersBar.tsx | 63 | Select | — | — | — | — |
| src/features/finance/components/FinanceFiltersBar.tsx | 78 | Select | — | — | — | — |
| src/features/finance/components/FinanceFiltersBar.tsx | 95 | Select | — | — | — | — |
| src/features/finance/components/FinanceFiltersBar.tsx | 116 | Select | — | — | — | — |
| src/features/finance/components/FixedExpenseEditModal.tsx | 85 | Select | — | — | — | — |
| src/features/finance/components/FixedExpenseEditModal.tsx | 111 | TextInput | "editFeDescription" | "Ex.: aluguel da clínica" | — | — |
| src/features/finance/components/FixedExpenseEditModal.tsx | 126 | TextInput | "editFeAmount" | "R$ 0,00" | — | Yes |
| src/features/finance/components/FixedExpenseEditModal.tsx | 142 | Select | — | — | — | — |
| src/features/finance/components/FixedExpenseEditModal.tsx | 159 | TextInput | "editFeDueDay" | "1–31" | — | — |
| src/features/finance/components/FixedExpenseEditModal.tsx | 176 | DatePickerInput | "editFeStartDate" | — | — | Yes |
| src/features/finance/components/FixedExpenseEditModal.tsx | 189 | DatePickerInput | "editFeEndDate" | — | — | Yes |
| src/features/finance/components/FixedExpenseForm.tsx | 64 | Select | — | — | — | — |
| src/features/finance/components/FixedExpenseForm.tsx | 85 | TextInput | "fixedDescription" | "Ex.: aluguel da clínica" | — | — |
| src/features/finance/components/FixedExpenseForm.tsx | 103 | TextInput | "fixedAmount" | "R$ 0,00" | — | Yes |
| src/features/finance/components/FixedExpenseForm.tsx | 119 | Select | — | — | — | — |
| src/features/finance/components/FixedExpenseForm.tsx | 134 | TextInput | "fixedDueDay" | "1–31" | — | — |
| src/features/finance/components/FixedExpenseForm.tsx | 147 | DatePickerInput | "fixedStartDate" | — | — | Yes |
| src/features/finance/components/ProcedureMarginsSection.tsx | 467 | select | "procedure-sort" | — | — | — |
| src/features/finance/components/TransactionEditModal.tsx | 80 | Select | — | — | — | — |
| src/features/finance/components/TransactionEditModal.tsx | 94 | Select | — | — | — | — |
| src/features/finance/components/TransactionEditModal.tsx | 117 | Select | — | — | — | — |
| src/features/finance/components/TransactionEditModal.tsx | 143 | TextInput | "editTxDescription" | "Ex.: pagamento de clareamento" | — | — |
| src/features/finance/components/TransactionEditModal.tsx | 158 | TextInput | "editTxAmount" | "R$ 0,00" | — | Yes |
| src/features/finance/components/TransactionEditModal.tsx | 174 | DatePickerInput | "editTxDate" | — | — | Yes |
| src/features/finance/components/TransactionEditModal.tsx | 182 | DatePickerInput | "editTxDueDate" | — | — | Yes |
| src/features/finance/components/TransactionForm.tsx | 63 | Select | — | — | — | — |
| src/features/finance/components/TransactionForm.tsx | 77 | Select | — | — | — | — |
| src/features/finance/components/TransactionForm.tsx | 93 | Select | — | — | — | — |
| src/features/finance/components/TransactionForm.tsx | 121 | TextInput | "transactionAmount" | "R$ 0,00" | — | Yes |
| src/features/finance/components/TransactionForm.tsx | 137 | DatePickerInput | "transactionDate" | — | — | Yes |
| src/features/finance/components/TransactionForm.tsx | 145 | DatePickerInput | "transactionDueDate" | — | — | Yes |
| src/features/finance/components/TransactionForm.tsx | 157 | TextInput | "transactionDescription" | "Ex.: pagamento de clareamento" | — | — |
| src/features/fiscal/components/AppointmentInvoicePickerModal.tsx | 147 | TextInput | "appointmentInvoicePatientSearch" | "Buscar por nome..." | — | — |
| src/features/fiscal/components/AppointmentInvoicePickerModal.tsx | 167 | Select | — | — | — | — |
| src/features/fiscal/components/FiscalInvoiceFiltersBar.tsx | 50 | TextInput | "invoiceCustomer" | "Buscar por cliente..." | — | — |
| src/features/fiscal/components/FiscalInvoiceFiltersBar.tsx | 58 | Select | — | — | — | — |
| src/features/fiscal/components/FiscalInvoiceFiltersBar.tsx | 80 | DatePickerInput | "invoiceTo" | — | — | Yes |
| src/features/fiscal/components/FiscalProfileForm.tsx | 247 | TextInput | "legalName" | "Razão social registrada no CNPJ" | "organization" | — |
| src/features/fiscal/components/FiscalProfileForm.tsx | 259 | TextInput | "tradeName" | "Nome fantasia da clínica" | — | — |
| src/features/fiscal/components/FiscalProfileForm.tsx | 268 | TextInput | "documentNumber" | "00.000.000/0000-00" | — | Yes |
| src/features/fiscal/components/FiscalProfileForm.tsx | 285 | TextInput | "municipalRegistration" | "Informe a inscrição municipal" | — | — |
| src/features/fiscal/components/FiscalProfileForm.tsx | 294 | TextInput | "stateRegistration" | "Informe a inscrição estadual" | — | — |
| src/features/fiscal/components/FiscalProfileForm.tsx | 313 | TextInput | "zipCode" | "00000-000" | "postal-code" | Yes |
| src/features/fiscal/components/FiscalProfileForm.tsx | 338 | TextInput | "street" | "Rua, avenida ou logradouro" | — | — |
| src/features/fiscal/components/FiscalProfileForm.tsx | 347 | TextInput | "number" | "Ex: 120 ou S/N" | — | — |
| src/features/fiscal/components/FiscalProfileForm.tsx | 356 | TextInput | "complement" | "Sala, bloco, andar" | — | — |
| src/features/fiscal/components/FiscalProfileForm.tsx | 365 | TextInput | "neighborhood" | "Bairro" | — | — |
| src/features/fiscal/components/FiscalProfileForm.tsx | 374 | TextInput | "city" | "Cidade" | — | — |
| src/features/fiscal/components/FiscalProfileForm.tsx | 383 | TextInput | "state" | "SP" | — | Yes |
| src/features/fiscal/components/FiscalProfileForm.tsx | 405 | Select | — | — | — | — |
| src/features/fiscal/components/FiscalProfileForm.tsx | 429 | TextInput | "issRate" | "Ex: 2,00" | — | — |
| src/features/fiscal/components/FiscalProfileForm.tsx | 440 | TextInput | "profileServiceCode" | "Ex: 04.12" | — | — |
| src/features/fiscal/components/FiscalProfileForm.tsx | 449 | TextInput | "cnae" | "Ex: 8630-5/04" | — | — |
| src/features/fiscal/components/FiscalProfileForm.tsx | 463 | TextInput | "ibgeCode" | "Ex: 3550308" | — | — |
| src/features/fiscal/components/InvoiceForm.tsx | 116 | TextInput | "customerName" | "Nome do cliente ou paciente" | — | — |
| src/features/fiscal/components/InvoiceForm.tsx | 134 | TextInput | "customerDocument" | "000.000.000-00 ou 00.000.000/0000-00" | — | Yes |
| src/features/fiscal/components/InvoiceForm.tsx | 151 | TextInput | "customerEmail" | "nome@exemplo.com" | "off" | — |
| src/features/fiscal/components/InvoiceForm.tsx | 172 | TextInput | "customerPhone" | "(00) 00000-0000" | "off" | Yes |
| src/features/fiscal/components/InvoiceForm.tsx | 202 | TextArea | "serviceDescription" | "Descreva o serviço prestado..." | — | — |
| src/features/fiscal/components/InvoiceForm.tsx | 216 | TextInput | "serviceCode" | "Ex: 04.12 ou código municipal" | — | — |
| src/features/fiscal/components/InvoiceForm.tsx | 225 | TextInput | "amount" | "R$ 0,00" | — | Yes |
| src/features/fiscal/components/InvoiceForm.tsx | 250 | DatePickerInput | "competenceDate" | — | — | Yes |
| src/features/fiscal/components/InvoiceForm.tsx | 268 | TextArea | "notes" | "Informações adicionais sobre a nota..." | — | — |
| src/features/fiscal/containers/FiscalInvoicesPageContainer.tsx | 576 | TextInput | "cancelReason" | "Ex.: erro nos dados do tomador, duplicidade ou cancelamento solicitado" | — | — |
| src/features/inventory/components/CategoryManagerModal.tsx | 223 | TextInput | "stockCategoryName" | "Ex.: Materiais descartáveis" | — | — |
| src/features/inventory/components/CategoryManagerModal.tsx | 245 | TextInput | "stockCategoryColor" | "#1E3A8A" | — | — |
| src/features/inventory/components/ProductFormModal.tsx | 242 | TextInput | "prodName" | "Digite o nome do produto" | — | — |
| src/features/inventory/components/ProductFormModal.tsx | 259 | Select | — | — | — | — |
| src/features/inventory/components/ProductFormModal.tsx | 282 | TextInput | "prodUnit" | "Ex.: unidade, caixa, ml" | — | — |
| src/features/inventory/components/ProductFormModal.tsx | 296 | TextInput | "prodSupplier" | "Nome do fornecedor" | — | — |
| src/features/inventory/components/ProductFormModal.tsx | 325 | TextInput | "prodQty" | "0" | — | Yes |
| src/features/inventory/components/ProductFormModal.tsx | 342 | TextInput | "prodMinQty" | "0" | — | Yes |
| src/features/inventory/components/ProductFormModal.tsx | 357 | DatePickerInput | "prodExpiry" | — | — | Yes |
| src/features/inventory/components/ProductFormModal.tsx | 372 | TextInput | "prodPrice" | "R$ 0,00" | — | Yes |
| src/features/inventory/components/ProductFormModal.tsx | 391 | TextArea | "prodDesc" | "Descrição do produto..." | — | — |
| src/features/inventory/components/ProductFormModal.tsx | 400 | TextArea | "prodNotes" | "Observações visíveis apenas para a equipe..." | — | — |
| src/features/inventory/components/StockMovementModal.tsx | 197 | input | "stockMovementType" | — | — | — |
| src/features/inventory/components/StockMovementModal.tsx | 249 | TextInput | "stockMovementNewQuantity" | "0" | — | Yes |
| src/features/inventory/components/StockMovementModal.tsx | 272 | TextInput | "stockMovementQuantity" | "0" | — | Yes |
| src/features/inventory/components/StockMovementModal.tsx | 299 | TextInput | "stockMovementReason" | "Ex.: Reposição, uso clínico, contagem física..." | — | — |
| src/features/inventory/components/StockMovementModal.tsx | 310 | TextArea | "stockMovementNotes" | "Detalhes internos da movimentação..." | — | — |
| src/features/inventory/containers/InventoryPageContainer.tsx | 122 | TextInput | "stockSearch" | "Buscar produto..." | — | — |
| src/features/inventory/containers/InventoryPageContainer.tsx | 131 | Select | — | — | — | — |
| src/features/inventory/containers/InventoryPageContainer.tsx | 149 | Select | — | — | — | — |
| src/features/notifications/components/ConsentToggle.tsx | 26 | input | — | — | — | — |
| src/features/notifications/pages/NotificationSettingsPage.tsx | 220 | Select | — | — | — | — |
| src/features/patients/components/PatientAvatarWidget.tsx | 150 | input | — | — | — | — |
| src/features/patients/containers/PatientsAttentionContainer.tsx | 452 | TextInput | "attentionSearch" | "Nome ou e-mail…" | — | — |
| src/features/patients/containers/PatientsAttentionContainer.tsx | 463 | Select | — | — | — | — |
| src/features/patients/containers/PatientsAttentionContainer.tsx | 483 | Select | — | — | — | — |
| src/features/patients/containers/PatientsAttentionContainer.tsx | 503 | Select | — | — | — | — |
| src/features/patients/containers/PatientsPageContainer.tsx | 592 | TextInput | "patientSearch" | "Nome ou e-mail…" | — | — |
| src/features/patients/containers/PatientsPageContainer.tsx | 601 | DatePickerInput | "patientFrom" | "DD/MM/AAAA" | — | Yes |
| src/features/patients/containers/PatientsPageContainer.tsx | 609 | DatePickerInput | "patientTo" | "DD/MM/AAAA" | — | Yes |
| src/features/privacy/pages/PrivacyRequestFormPage.tsx | 181 | TextInput | "privacy-name" | "Seu nome completo" | "name" | — |
| src/features/privacy/pages/PrivacyRequestFormPage.tsx | 195 | TextInput | "privacy-email" | "seu@email.com" | "email" | — |
| src/features/privacy/pages/PrivacyRequestFormPage.tsx | 211 | Select | — | — | — | — |
| src/features/privacy/pages/PrivacyRequestFormPage.tsx | 229 | TextInput | "privacy-clinic" | "Nome da clínica relacionada (se aplicável)" | "organization" | — |
| src/features/privacy/pages/PrivacyRequestFormPage.tsx | 243 | Select | — | — | — | — |
| src/features/privacy/pages/PrivacyRequestFormPage.tsx | 265 | TextArea | "privacy-description" | "Descreva sua solicitação em detalhes..." | — | — |
| src/features/privacy/pages/PrivacyRequestFormPage.tsx | 300 | input | — | — | — | — |
| src/features/reports/containers/ReportsPageContainer.tsx | 252 | DatePickerInput | "fin-start" | — | — | Yes |
| src/features/reports/containers/ReportsPageContainer.tsx | 261 | DatePickerInput | "fin-end" | — | — | Yes |
| src/features/reports/containers/ReportsPageContainer.tsx | 270 | Select | — | — | — | — |
| src/features/reports/containers/ReportsPageContainer.tsx | 293 | Select | — | — | — | — |
| src/features/reports/containers/ReportsPageContainer.tsx | 339 | DatePickerInput | "appt-start" | — | — | Yes |
| src/features/reports/containers/ReportsPageContainer.tsx | 346 | DatePickerInput | "appt-end" | — | — | Yes |
| src/features/reports/containers/ReportsPageContainer.tsx | 353 | Select | — | — | — | — |
| src/features/reports/containers/ReportsPageContainer.tsx | 481 | Select | — | — | — | — |
| src/features/reports/containers/ReportsPageContainer.tsx | 520 | DatePickerInput | "inv-start" | — | — | Yes |
| src/features/reports/containers/ReportsPageContainer.tsx | 529 | DatePickerInput | "inv-end" | — | — | Yes |
| src/features/reports/containers/ReportsPageContainer.tsx | 536 | Select | — | — | — | — |
| src/features/scheduling/components/appointments/AppointmentPaymentSection.tsx | 237 | Select | — | — | — | — |
| src/features/scheduling/components/appointments/AppointmentPaymentSection.tsx | 253 | TextInput | {fieldId('estimated')} | "0,00" | "off" | Yes |
| src/features/scheduling/components/appointments/AppointmentPaymentSection.tsx | 265 | TextInput | {fieldId('paid')} | "0,00" | "off" | Yes |
| src/features/scheduling/components/appointments/AppointmentPaymentSection.tsx | 277 | Select | — | — | — | — |
| src/features/scheduling/components/appointments/AppointmentPaymentSection.tsx | 301 | DatePickerInput | {fieldId('date')} | "DD/MM/AAAA" | — | Yes |
| src/features/scheduling/components/appointments/AppointmentPaymentSection.tsx | 316 | TextArea | {fieldId('notes')} | "Observações sobre o pagamento..." | — | — |
| src/features/scheduling/components/appointments/AppointmentServiceValueSection.tsx | 97 | Select | — | — | — | — |
| src/features/scheduling/components/appointments/AppointmentServiceValueSection.tsx | 127 | TextInput | "appt-estimatedAmount" | "0,00" | "off" | Yes |
| src/features/scheduling/components/appointments/CancelAppointmentDialog.tsx | 51 | TextArea | "cancellationReason" | "Informe o motivo (opcional)" | — | — |
| src/features/scheduling/components/appointments/CreateAppointmentModal.tsx | 389 | Select | — | — | — | — |
| src/features/scheduling/components/appointments/CreateAppointmentModal.tsx | 438 | DatePickerInput | "appointmentDate" | — | — | Yes |
| src/features/scheduling/components/appointments/CreateAppointmentModal.tsx | 562 | TextInput | "patientName" | "Nome completo" | "off" | — |
| src/features/scheduling/components/appointments/CreateAppointmentModal.tsx | 586 | TextInput | "patientEmail" | "nome@exemplo.com" | "off" | — |
| src/features/scheduling/components/appointments/CreateAppointmentModal.tsx | 608 | TextInput | "patientPhone" | "(11) 99999-9999" | "off" | Yes |
| src/features/scheduling/components/appointments/CreateAppointmentModal.tsx | 631 | TextArea | "notes" | "Anotações internas sobre a consulta..." | — | — |
| src/features/scheduling/components/appointments/EditAppointmentModal.tsx | 312 | TextInput | "editPatientName" | "Nome completo" | "off" | — |
| src/features/scheduling/components/appointments/EditAppointmentModal.tsx | 328 | TextInput | "editPatientEmail" | "nome@exemplo.com" | "off" | — |
| src/features/scheduling/components/appointments/EditAppointmentModal.tsx | 350 | TextInput | "editPatientPhone" | "(11) 99999-9999" | "off" | Yes |
| src/features/scheduling/components/appointments/EditAppointmentModal.tsx | 396 | DatePickerInput | "editAppointmentDate" | — | — | Yes |
| src/features/scheduling/components/appointments/EditAppointmentModal.tsx | 429 | TextArea | "editNotes" | "Anotações internas sobre a consulta..." | — | — |
| src/features/scheduling/components/appointments/PatientPicker.tsx | 74 | TextInput | "patientSearchQuery" | "Buscar paciente por nome ou e-mail" | "off" | — |
| src/features/scheduling/components/availability/AvailabilitySlotForm.tsx | 73 | Select | "dayOfWeek" | — | — | — |
| src/features/scheduling/components/availability/AvailabilitySlotForm.tsx | 99 | TimeInput | {ids.startTime} | — | — | Yes |
| src/features/scheduling/components/availability/AvailabilitySlotForm.tsx | 111 | TimeInput | {ids.endTime} | — | — | Yes |
| src/features/scheduling/components/availability/ExceptionForm.tsx | 108 | DatePickerInput | {ids.exceptionDate} | — | — | Yes |
| src/features/scheduling/components/availability/ExceptionForm.tsx | 159 | TimeInput | {ids.startTime} | — | — | Yes |
| src/features/scheduling/components/availability/ExceptionForm.tsx | 171 | TimeInput | {ids.endTime} | — | — | Yes |
| src/features/scheduling/components/availability/ExceptionForm.tsx | 186 | TextInput | {ids.reason} | {isDayOff ? 'Ex: Feriado, Férias...' : 'Ex: Atendimento emergencial...'} | — | — |
| src/features/scheduling/components/calendar/WeekCalendar.tsx | 129 | DatePickerInput | — | — | — | Yes |
| src/features/settings/containers/SettingsPageContainer.tsx | 299 | TextInput | "clinic-name" | "Ex: Odonto Saúde" | "organization" | — |
| src/features/settings/containers/SettingsPageContainer.tsx | 313 | TextInput | "clinic-email" | "contato@clinica.com.br" | "email" | — |
| src/features/settings/containers/SettingsPageContainer.tsx | 329 | TextInput | "clinic-phone" | "(11) 99999-9999" | "tel" | Yes |
| src/features/settings/containers/SettingsPageContainer.tsx | 350 | TextInput | "clinic-website" | "https://www.clinica.com.br" | — | — |
| src/features/settings/containers/SettingsPageContainer.tsx | 378 | TextInput | "clinic-address1" | "Rua, número" | "address-line1" | — |
| src/features/settings/containers/SettingsPageContainer.tsx | 395 | TextInput | "clinic-address2" | "Sala, bloco, andar" | "address-line2" | — |
| src/features/settings/containers/SettingsPageContainer.tsx | 407 | TextInput | "clinic-city" | "São Paulo" | "address-level2" | — |
| src/features/settings/containers/SettingsPageContainer.tsx | 420 | TextInput | "clinic-state" | "SP" | — | Yes |
| src/features/settings/containers/SettingsPageContainer.tsx | 434 | TextInput | "clinic-cep" | "00000-000" | "postal-code" | Yes |
| src/features/team/components/ClinicMemberFormModal.tsx | 294 | Select | — | — | — | — |
| src/features/team/components/ClinicMemberFormModal.tsx | 318 | PasswordInput | "memberPassword" | "Crie uma senha inicial" | "new-password" | — |

An absent placeholder prop is not automatically a defect: dates/times use shared prompts; selected defaults have a visible value; password fields have wrapper defaults; native file/radio/checkbox controls and color swatches use labels/helpers. This inventory proves search coverage, not browser interaction or backend acceptance for every row.
