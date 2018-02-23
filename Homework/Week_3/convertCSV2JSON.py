import json

# creates json from csv
def csv_to_json(file_name):


	# determines which rows, columns are used
	start_row = 5
	end_row = -2

	first_column = 0
	second_column = 8

	# determines what datatype values are casted to
	type_a = int 
	type_b = int

	datapoints = []

	with open(file_name, 'r') as infile:
	    data=infile.read()
	if not data:
		print('error')

	infile.close()  

	
	# creates rows
	rows  = data.split("\n")
	# selects rows
	rows = rows[start_row:end_row]

	# writes selected data to json
	with open('data.json', 'w') as outfile:
		for row in rows:
			
			columns = row.split(";")

			datapoint = {'value_a' : type_a(columns[first_column]), 'value_b' : type_b(columns[second_column])}

			datapoints.append(datapoint)

		# writes all datapoints to json
		json.dump(datapoints, outfile, indent = 4)

	outfile.close()


csv_to_json('2017_jaarboek_211.csv')



