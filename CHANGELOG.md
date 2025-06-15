# search_and_populate_data_from_another_project 0.7.1 (released 2025-06-15)
- Update CITATION.cff

# search_and_populate_data_from_another_project 0.7.0 (released 2025-06-15)
- Use correct names in the citation.cff (@saipavan10-git, #38, #37)
- Use the integrated JSON linting that the framework provides (@saipavan10-git, #36, #37)
- Upgrade framework version to 16 (@saipavan10-git, #36, #37)

# search_and_populate_data_from_another_project 0.6.1 (released 2025-03-05)
- Add CITATION.cff (@pbchase, #34, #35)

# search_and_populate_data_from_another_project 0.6.0 (released 2025-02-13)
- Merge pull request #33 from saipavan10-git/module_improvements (@pbchase)
- Update README (@pbchase, #33)
- Add checkbox filling functionality and support all RC versions (@saipavan10-git, #27, #33)
- Fix issue with codebook URLs in our RC (@saipavan10-git, #30, #33)
- Add checks for RC versions where new search is implemented (@saipavan10-git, #30, #33)
- change back to min version for RC (@saipavan10-git, #30, #33)

# search_and_populate_data_from_another_project 0.5.1 (released 2025-02-12)
- Update README with new requirements and limitations (@pbchase, #26)

# search_and_populate_data_from_another_project 0.5.0 (released 2025-02-12)
- Address issue #30 'No data copied' (@saipavan10-git, #30, #32)
- Address issue #29 'Bug and error on field mapping' (@saipavan10-git, #29, #32)
- Add a max redcap version (@saipavan10-git, @pbchase, #32)
- Update Framework version (@saipavan10-git, #32)
- Create AUTHORS.md (@saipavan10-git, @pbchase, #31, #32)

## [0.4.0] - 2021-10-28
### Added
- Add support for populating dropdown fields, both autocompleting and regular (Kyle Chesney)


## [0.3.1] - 2021-04-02
### Changed
- Remove trailing comma from final param to getDataDictionary call to support PHP < 7.3 (Kyle Chesney)


## [0.3.0] - 2021-04-01
### Added
- Add Limit fields to search option Add fetchMappings helper function to backend (Kyle Chesney)

### Changed
- Update README to state lack of multi-arm support (Kyle Chesney)
- Fix php call causing breakage as early as redcap v10.5.1 hardcode arm arg in enableDataSearchAutocomplete call (Kyle Chesney)
- Dynamically updates source codebook href (mbentz)
- Support piping to non-YMD[_HMS] date types (Kyle Chesney)


## [0.2.4] - 2020-10-06
### Changed
- Add Zenodo DOI badge to README (Philip Chase)


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
