import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { SubscriptionType, FormData } from '../../core/form.interfaces';

@Component({
  selector: 'app-form',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  form!: FormGroup;
  
  showFormErrors = signal(false);
  private formTouched = signal(false);
  hasFormChanged = computed(() => this.formTouched());
  
  subscriptionOptions: SubscriptionType[] = ['Basic', 'Advanced', 'Pro'];
  private initialFormState: Partial<FormData> = {};

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormChangeTracking();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, this.nameValidator]],
      lastName: ['', [Validators.required, this.nameValidator]],
      email: ['', [Validators.required, Validators.email]],
      subscription: ['Advanced'],
      password: ['', [Validators.required, this.passwordValidator]],
      csvFile: ['', [Validators.required, this.csvFileValidator]]
    })

    this.initialFormState = this.form.value;
  }

  private setupFormChangeTracking(): void {
    this.form.valueChanges.subscribe(() => {
      const currentValue = this.form.value;
      const hasChanged = JSON.stringify(currentValue) !== JSON.stringify(this.initialFormState);
      this.formTouched.set(hasChanged);
    });
  }

  private nameValidator = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    
    return /^[a-zA-Z\s]*$/.test(value) ? null : { invalidName: true };
  };

  private passwordValidator = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return { required: true };
    
    const hasMinLength = value.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
    
    if (!hasMinLength) return { minlength: { requiredLength: 8, actualLength: value.length } };
    if (!hasLetter) return { missingLetter: true };
    if (!hasSpecialChar) return { missingSpecialChar: true };
    
    return null;
  };


  private csvFileValidator = (control: AbstractControl): ValidationErrors | null => {
    const file = control.value as File;
    if (!file) return null;
    
    return file.name.toLowerCase().endsWith('.csv') ? null : { invalidFileType: true };
  };

  shouldShowFieldError(fieldName: keyof FormData): boolean {
    const control = this.form.get(fieldName);
    if (!control) return false;
    return (
      (control.touched && control.invalid)
    ) || (
      this.showFormErrors() && control.invalid
    );
  }

  getFieldError(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control?.errors) return '';

    const errors = control.errors;
    const displayName = this.getFieldDisplayName(fieldName);
    
    if (errors['required']) return `${displayName} is required`;
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['invalidName']) return `${displayName} can only contain letters and spaces`;
    if (errors['invalidFileType']) return 'Please select a valid CSV file';
    
    if (errors['minlength'] && fieldName === 'password') return 'Password must be at least 8 characters long';
    if (errors['missingLetter']) return 'Password must contain at least one letter';
    if (errors['missingSpecialChar']) return 'Password must contain at least one special character';
    
    return `Please enter a valid ${displayName.toLowerCase()}`;
  }

  getFormErrors(): string[] {
    return Object.keys(this.form.controls)
      .filter(key => this.form.get(key)?.invalid && this.form.get(key)?.touched)
      .map(key => this.getFieldError(key as keyof FormData))
      .filter(error => error);
  }

  private getFieldDisplayName(fieldName: string): string {
    const names: Record<string, string> = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      password: 'Password',
      csvFile: 'CSV file'
    };
    return names[fieldName] || fieldName;
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] || null;
    this.form.patchValue({ csvFile: file });
    this.form.get('csvFile')?.markAsTouched();
  }

  onSubmit(): void {
    this.showFormErrors.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return
    } else { 
      const formData: FormData = this.form.value;
      this.router.navigate(['/results'], { 
        state: { formData } 
      });
    }
  }

  onClear(): void {
    if (this.hasFormChanged() && !confirm('Are you sure you want to discard all changes?')) {
      return;
    }

    this.form.reset({ subscription: 'Advanced' });
    const fileInput = document.getElementById('csvFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    this.showFormErrors.set(false);
    this.formTouched.set(false);
    this.initialFormState = this.form.value;
  }
}