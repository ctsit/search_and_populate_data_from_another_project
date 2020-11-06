# Change Log
All notable changes to the Search and Populate Data From Another Project module will be 
documented in this file. This project adheres to [Semantic Versioning](http://semver.org/).


## [0.2.3] - 2020-10-06
### Changed
- Explain (lack of) auth check for access to source project data (Kyle Chesney)


## [0.2.2] - 2020-10-02
### Changed
- Fire REDCap rules on target fields as they are written to (Kyle Chesney)


## [0.2.1] - 2020-08-21
### Changed
- Support all radio layouts, map using coded values instead of choice labels (Kyle Chesney)
- Hide field search selector (Kyle Chesney)
- Force target_forms to array if only 1 entry (Kyle Chesney)


## [0.2.0] - 2020-07-14
### Added
- Display a confirmation modal during data copying (James Pence)
- Allow use on multiple forms with multiple mappings broke (Kyle Chesney)


## [0.1.0] - 2020-07-02
### Summary
- First release of Search and Populate Data From Another Project module (Kyle Chesney)
- Has the ability to search records of another project.
- Has the ability to write data from the selected source record into the current form.
- Limitied to operation on only one data entry form.
- Allows for configurable field name mapping between source and target projects.
- Has a JSON validator for for the field mapping configuration
- Has hotlinks to the Source and Target codebooks.
