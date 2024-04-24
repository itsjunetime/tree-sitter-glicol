module.exports = grammar({
	name: 'glicol',

	rules: {
		source_file: $ => seq(
			optional($.ws),
			repeat(
				seq(
					prec.right(200, choice($.comment, $.line)),
					optional($.ws),
					optional(';'),
					optional($.ws),
					repeat(
						seq(
							'\n',
							optional($.ws)
						)
					)
				)
			)
		),
		comment: $ => seq(
			'//',
			/[^\n]*/,
			prec.right(1, repeat1('\n'))
		),
		line: $ => seq(
			$.ref,
			repeat(
				choice(
					' ',
					'\t'
				)
			),
			':',
			repeat(
				choice(
					' ',
					'\t',
					'\n'
				)
			),
			$.chain
		),
		chain: $ => prec.right(
			100,
			seq(
				$.node,
				repeat(
					seq(
						repeat(
							choice(
								' ',
								'\t',
								'\n'
							)
						),
						'>>',
						$.ws,
						$.node
					)
				)
			)
		),
		node: $ => prec.right(
			80,
			choice(
				$.reverb,
				$.arrange,
				$.psampler,
				$.send,
				$.seq,
				$.choose,
				$.op,
				$.sp,
				$.constsig,
				$.lpf,
				$.num_ref_num,
				$.one_num,
				$.envperc,
				$.get,
				$.expr,
				$.eval,
				$.point_node,
				$.meta,
				$.synth,
				$.balance,
				$.pattern_synth,
				$.msgsynth,
				$.adsr
			)
		),
		ident: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
		maybe_ident: $ => choice(
			$.ident,
			'_',
			'-'
		),
		ref: $ => seq(
			optional('~'),
			$.ident
		),
		ws: $ => /\s+/,
		sep: $ => choice(
			' ',
			',',
			'|',
			'\t',
			'\n'
		),
		int: $ => /[0-9]+/,
		num: $ => /[0-9]+(\.[0-9]+)?/,
		ws_num: $ => seq(
			$.ws,
			$.num
		),
		reverb: $ => seq(
			'reverb',
			$.ws_num,
			$.ws_num,
			$.ws_num,
			$.ws_num,
			$.ws_num
		),
		arrange: $ => seq(
			'arrange',
			prec.right(
				1,
				repeat1(
					seq(
						$.ws,
						$.ref,
						$.ws_num
					)
				)
			)
		),
		psampler: $ => seq(
			'psampler',
			$.ws,
			choice(
				$.pattern,
				$.event
			)
		),
		send: $ => seq(
			choice(
				'mix',
				'sendpass'
			),
			prec.right(
				1,
				repeat1(
					seq(
						$.ws,
						$.ref
					)
				)
			)
		),
		seq: $ => seq(
			'seq',
			$.compound_notes
		),
		choose: $ => seq(
			'choose',
			prec.right(
				1,
				repeat1(
					seq(
						$.ws,
						$.int
					)
				)
			)
		),
		op: $ => seq(
			choice(
				'mul',
				'add',
				'sin',
				'saw',
				'squ',
				'tri',
				'pan',
				'onepole',
				'delayn',
				'delayms'
			),
			$.ws,
			choice(
				$.num,
				$.ref
			)
		),
		sp: $ => seq(
			choice(
				'sp',
				'sampler'
			),
			$.ws,
			$.sym
		),
		constsig: $ => seq(
			choice(
				'sig',
				'constsig'
			),
			$.ws,
			choice(
				$.num,
				$.pattern,
				$.event
			)
		),
		lpf: $ => seq(
			'lpf',
			$.ws,
			choice(
				$.num,
				$.ref,
				$.pattern,
				$.event,
			),
			$.ws_num,
		),
		num_ref_num: $ => seq(
			choice(
				'rhpf',
				'hpf',
				'apfgain',
				'apfmsgain'
			),
			$.ws,
			choice(
				$.num,
				$.ref
			),
			$.ws_num
		),
		one_num: $ => seq(
			choice(
				'imp',
				'bd',
				'sn',
				'hh',
				'noiz',
				'noise',
				'plate',
				'speed',
				'adc'
			),
			$.ws_num
		),
		envperc: $ => seq(
			'envperc',
			$.ws_num,
			$.ws_num
		),
		get: $ => seq(
			optional(
				seq(
					'get',
					$.ws
				)
			),
			$.ref
		),
		expr: $ => seq(
			'expr',
			$.sep,
			$.code
		),
		eval: $ => seq(
			'eval',
			prec.left(1, repeat1($.sep)),
			'`',
			$.eval_content,
			'`'
		),
		point_node: $ => prec.right(
			1,
			seq(
				$.points,
				prec.left(1, repeat($.sep)),
				optional($.math_expression),
				prec.left(1, repeat($.sep)),
				optional($.is_looping),
			)
		),
		meta: $ => seq(
			choice(
				'meta',
				'script'
			),
			$.ws,
			$.code
		),
		synth: $ => seq(
			choice(
				'saw',
				'squ',
				'tri'
			),
			'synth',
			$.ws_num,
			$.ws_num
		),
		balance: $ => seq(
			'balance',
			$.ws,
			$.ref,
			$.ws,
			$.ref
		),
		pattern_synth: $ => prec.right(
			1,
			seq(
				choice(
					'p',
					'p_',
					'pattern_'
				),
				'synth',
				$.ws,
				$.code,
				optional($.ws_num)
			)
		),
		msgsynth: $ => seq(
			'msg',
			optional('_'),
			'synth',
			$.ws,
			$.sym,
			$.ws_num,
			$.ws_num
		),
		adsr: $ => seq(
			'adsr',
			$.ws_num,
			$.ws_num,
			$.ws_num,
			$.ws_num
		),
		points: $ => prec(
			1,
			seq(
				'[',
				repeat($.sep),
				repeat($.point),
				repeat($.sep),
				']'
			)
		),
		point: $ => prec.right(
			1,
			seq(
				$.time,
				repeat($.sep),
				'=>',
				repeat($.sep),
				$.num,
				repeat($.sep)
			)
		),
		time: $ => prec.left(
			1,
			seq(
				choice(
					$.bar,
					$.num
				),
				optional(
					seq(
						repeat($.sep),
						$.sign,
						repeat($.sep),
						choice(
							$.ms,
							$.second
						)
					)
				)
			)
		),
		bar: $ => seq(
			$.int,
			repeat($.sep),
			'/',
			repeat($.sep),
			$.int
		),
		sign: $ => choice(
			'+',
			'-'
		),
		ms: $ => seq(
			$.num,
			'_ms',
		),
		second: $ => seq(
			$.num,
			'_s'
		),
		math_expression: $ => seq(
			choice(
				'/',
				'*'
			),
			repeat($.sep),
			choice(
				$.num,
				seq(
					'(',
					$.bar,
					')'
				)
			)
		),
		is_looping: $ => '!',
		eval_content: $ => seq(
			repeat(
				seq(
					repeat($.sep),
					$.eval_sentence,
				)
			),
			repeat($.sep),
			$.assign_value
		),
		eval_sentence: $ => seq(
			$.var,
			repeat($.sep),
			':=',
			repeat($.sep),
			$.assign_value,
			repeat($.sep),
			';'
		),
		var: $ => /[a-z]+[_a-z0-9]*/,
		assign_value: $ => repeat1(
			seq(
				/[^;`]/,
				choice(
					$.var,
					' ',
					'\n',
					'%',
					'+',
					'-',
					'*',
					'/',
					'^',
					'(',
					')',
					'[',
					']',
					'>=',
					'>=',
					'==',
					'!=',
					'>',
					'<',
					'true',
					'false',
					'&',
					'.',
					/[0-9]/
				)
			)
		),
		code: $ => prec.left(
			0,
			seq(
				'`',
				// this could probably be more accurate but i'm lazy
				/.*/,
				'`'
			)
		),
		compound_notes: $ => prec.right(
			20,
			/(\s+(~?[0-9]|_|\t)+)+/
		),
		pattern: $ => seq(
			$.event,
			'(',
			optional($.num),
			')'
		),
		event: $ => seq(
			'"',
			optional($.ws),
			$.value_time,
			repeat(
				seq(
					$.ws,
					$.value_time
				)
			),
			'"',
		),
		value_time: $ => seq(
			choice(
				$.num,
				$.sym,
			),
			'@',
			$.num
		),
		sym: $ => prec.right(
			1,
			choice(
				seq(
					"'",
					repeat1($.maybe_ident),
					"'"
				),
				seq(
					'\\',
					repeat1($.maybe_ident)
				)
			)
		),
	}
});
