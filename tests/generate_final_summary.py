import os
import glob
from openpyxl import load_workbook
from datetime import datetime

def generate_summary(search_dirs=["artifacts", "Test Results/Excel"]):
    # 1. Find all Excel reports
    report_files = []
    for d in search_dirs:
        if os.path.exists(d):
            # Find all xlsx files recursively, ignoring the final summary if it somehow exists
            found = glob.glob(os.path.join(d, '**/*.xlsx'), recursive=True)
            for f in found:
                if "Final_Test_Summary.xlsx" not in f:
                    report_files.append(f)

    # 2. Extract Data
    job_metrics = {}
    failed_tests = []
    
    total_tests = 0
    total_passed = 0
    total_failed = 0
    total_skipped = 0
    total_errors = 0
    total_duration = 0.0

    for file in report_files:
        try:
            wb = load_workbook(file, data_only=True)
            if "Test Results" not in wb.sheetnames:
                continue
            ws = wb["Test Results"]
            
            # Find column indices
            header = {cell.value: idx for idx, cell in enumerate(ws[1])}
            
            suite_col = header.get("Test Suite", 1)
            name_col = header.get("Test Name", 2)
            status_col = header.get("Status", 3)
            duration_col = header.get("Duration (s)", 4)
            error_col = header.get("Error Message", 5)

            current_job = "Unknown Job"
            job_duration = 0.0

            # Process rows
            for row in ws.iter_rows(min_row=2, values_only=True):
                if not row[suite_col]:
                    continue
                current_job = str(row[suite_col])
                test_name = str(row[name_col]) if row[name_col] else ""
                status = str(row[status_col]).upper() if row[status_col] else "UNKNOWN"
                
                try:
                    duration = float(row[duration_col]) if row[duration_col] else 0.0
                except (ValueError, TypeError):
                    duration = 0.0
                    
                error_msg = str(row[error_col]) if row[error_col] else ""

                if current_job not in job_metrics:
                    job_metrics[current_job] = {
                        "Total": 0, "Passed": 0, "Failed": 0, "Skipped": 0, "Errors": 0, "Duration": 0.0
                    }
                
                job_metrics[current_job]["Total"] += 1
                job_metrics[current_job]["Duration"] += duration
                total_duration += duration
                total_tests += 1

                if status == "PASSED":
                    job_metrics[current_job]["Passed"] += 1
                    total_passed += 1
                elif status == "FAILED":
                    job_metrics[current_job]["Failed"] += 1
                    total_failed += 1
                    failed_tests.append({
                        "Job": current_job,
                        "Test": test_name,
                        "Error": error_msg,
                        "Duration": duration
                    })
                elif status == "SKIPPED":
                    job_metrics[current_job]["Skipped"] += 1
                    total_skipped += 1
                else:
                    job_metrics[current_job]["Errors"] += 1
                    total_errors += 1
                    failed_tests.append({
                        "Job": current_job,
                        "Test": test_name,
                        "Error": error_msg,
                        "Duration": duration
                    })
        except Exception as e:
            print(f"Error reading {file}: {e}")

    # 3. Generate Markdown
    md_lines = []
    
    # Overall Summary
    overall_pass_pct = (total_passed / total_tests * 100) if total_tests > 0 else 0.0
    overall_fail_pct = (total_failed / total_tests * 100) if total_tests > 0 else 0.0
    
    jobs_passed = sum(1 for j in job_metrics.values() if j["Failed"] == 0 and j["Errors"] == 0)
    jobs_failed = sum(1 for j in job_metrics.values() if j["Failed"] > 0 or j["Errors"] > 0)
    jobs_skipped = 0 # Based on current extraction logic, jobs aren't inherently skipped, tests are.

    md_lines.append("## 🧪 Overall Test Summary\n")
    md_lines.append("| Metric | Value |")
    md_lines.append("| :--- | ---: |")
    md_lines.append(f"| Total Test Jobs | {len(job_metrics)} |")
    md_lines.append(f"| Total Tests | {total_tests} |")
    md_lines.append(f"| ✅ Passed | {total_passed} |")
    md_lines.append(f"| ❌ Failed | {total_failed} |")
    md_lines.append(f"| ⏭️ Skipped | {total_skipped} |")
    md_lines.append(f"| ⚠️ Errors | {total_errors} |")
    md_lines.append(f"| Overall Pass Rate | {overall_pass_pct:.2f}% |")
    md_lines.append(f"| Overall Fail Rate | {overall_fail_pct:.2f}% |")
    md_lines.append(f"| Total Test Duration | {total_duration:.2f}s |")
    md_lines.append(f"| Jobs Passed | {jobs_passed} |")
    md_lines.append(f"| Jobs Failed | {jobs_failed} |")
    md_lines.append(f"| Jobs Skipped | {jobs_skipped} |\n")

    # Job Details
    md_lines.append("## 📊 Test-by-Test Details\n")
    md_lines.append("| Test / Job | Status | Total | Passed | Failed | Skipped | Errors | Pass % | Fail % | Duration |")
    md_lines.append("| :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |")
    
    for job, m in job_metrics.items():
        job_pass_pct = (m["Passed"] / m["Total"] * 100) if m["Total"] > 0 else 0.0
        job_fail_pct = (m["Failed"] / m["Total"] * 100) if m["Total"] > 0 else 0.0
        status_icon = "✅ Passed" if (m["Failed"] == 0 and m["Errors"] == 0) else "❌ Failed"
        
        md_lines.append(
            f"| {job} | {status_icon} | {m['Total']} | {m['Passed']} | {m['Failed']} | {m['Skipped']} | "
            f"{m['Errors']} | {job_pass_pct:.2f}% | {job_fail_pct:.2f}% | {m['Duration']:.2f}s |"
        )
    md_lines.append("\n")

    # Failed Tests
    if failed_tests:
        md_lines.append("## ❌ Failed Tests\n")
        md_lines.append("| Test / Job | Test Name | Error / Failure | Duration |")
        md_lines.append("| :--- | :--- | :--- | :--- |")
        for f in failed_tests:
            # Escape pipes in error messages for markdown tables
            safe_error = f['Error'].replace('|', '&#124;').replace('\n', ' ')
            md_lines.append(f"| {f['Job']} | {f['Test']} | {safe_error} | {f['Duration']:.2f}s |")
        md_lines.append("\n")

    markdown_output = "\n".join(md_lines)

    # 4. Write to GITHUB_STEP_SUMMARY
    summary_file = os.environ.get('GITHUB_STEP_SUMMARY')
    if summary_file and os.path.exists(summary_file):
        with open(summary_file, 'a', encoding='utf-8') as f:
            f.write(markdown_output)
        print(f"Appended test summary to {summary_file}")
    else:
        print("GITHUB_STEP_SUMMARY not found. Printing to stdout instead:\n")
        print(markdown_output)

if __name__ == "__main__":
    generate_summary()
