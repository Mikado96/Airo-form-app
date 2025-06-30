import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CsvParserService } from '../../core/services/csv-parser.service';
import { FormData, CsvData } from '../../core/form.interfaces'

@Component({
  selector: 'app-results',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent implements OnInit {
  private router = inject(Router);
  private csvParser = inject(CsvParserService);

  formData = signal<FormData | null>(null);
  csvData = signal<CsvData | null>(null);
  isLoadingCsv = signal(false);
  csvError = signal<string | null>(null);

  hasFormData = computed(() => !!this.formData());
  hasCsvData = computed(() => !!this.csvData());
  
  ngOnInit(): void {
    this.loadFormData();
  }

  private loadFormData(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state || history.state;
    
    if (state?.formData) {
      this.formData.set(state.formData);
      this.loadCsvData(state.formData.csvFile);
    } else {
      this.router.navigate(['/form']);
    }
  }

  private async loadCsvData(file: File): Promise<void> {
    if (!file) return;

    this.isLoadingCsv.set(true);
    this.csvError.set(null);

    try {
      const csvData = await this.csvParser.parseFile(file);
      this.csvData.set(csvData);
    } catch (error) {
      this.csvError.set(error instanceof Error ? error.message : 'Failed to parse CSV file');
    } finally {
      this.isLoadingCsv.set(false);
    }
  }

  onBackToForm(): void {
    this.router.navigate(['/form']);
  }

  onDownloadData(): void {
    const data = this.formData();
    if (!data) return;

    const dataToExport = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      subscription: data.subscription,
      csvFileName: data.csvFile.name
    };

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'form-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}